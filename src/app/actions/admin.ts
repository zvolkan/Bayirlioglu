'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { uploadProductImage, deleteProductImage, getSignedUploadUrl } from '@/lib/supabase-admin'
import { createAdminToken, verifyAdminToken, timingSafeEqual } from '@/lib/admin-auth'
import { safeInternalPath } from '@/lib/safe-redirect'

const ADMIN_COOKIE = 'admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 saat

// ─── YETKİ KONTROLÜ ──────────────────────────────────────────────────────────

/**
 * Her admin server action'ının BAŞINDA çağrılmalı.
 *
 * Middleware yalnızca yol (pathname) bazlı koruma yapar; server action'lar ise
 * herhangi bir herkese açık sayfaya POST edilerek çağrılabilir. Dolayısıyla
 * yetki kontrolünün action'ın kendi içinde olması şart.
 */
async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!(await verifyAdminToken(token))) {
    throw new Error('Yetkisiz erişim: admin oturumu gerekli')
  }
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// Basit brute-force yavaşlatma. Sunucusuz ortamda örnek başına tutulur —
// tek başına yeterli değildir ama otomatik denemeleri belirgin şekilde zorlaştırır.
const MAX_ATTEMPTS = 5
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000
const loginAttempts = new Map<string, { count: number; firstAt: number }>()

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(key)

  if (!record || now - record.firstAt > ATTEMPT_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAt: now })
    return true
  }
  record.count += 1
  return record.count <= MAX_ATTEMPTS
}

export async function adminLogin(formData: FormData) {
  const password = formData.get('password') as string
  const redirectTo = safeInternalPath(formData.get('redirect') as string, '/admin')

  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'unknown'

  if (!checkRateLimit(ip)) {
    redirect('/admin/giris?error=rate-limit')
  }

  const expected = process.env.ADMIN_PASSWORD

  // Sunucuda şifre tanımlı değilse girişe asla izin verme
  if (!expected) {
    console.error('[admin] ADMIN_PASSWORD ortam değişkeni tanımlı değil')
    redirect('/admin/giris?error=config')
  }

  if (!password || !timingSafeEqual(password, expected)) {
    // Otomatik denemeleri yavaşlatmak için sabit gecikme
    await new Promise((resolve) => setTimeout(resolve, 600))
    redirect('/admin/giris?error=1')
  }

  loginAttempts.delete(ip)

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, await createAdminToken(COOKIE_MAX_AGE), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  redirect(redirectTo)
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  redirect('/admin/giris')
}

// ─── UPLOAD ───────────────────────────────────────────────────────────────────

/**
 * İstemcinin Supabase Storage'a doğrudan yüklemesi için signed URL üretir.
 * Dosya Vercel serverless function'dan geçmez → 4.5 MB payload limiti aşılmaz.
 */
export async function createSignedUploadUrl(fileName: string) {
  await requireAdmin()

  // Dosya adını temizle: yol geçişi (../), eğik çizgi ve tehlikeli karakterler
  const safeName = fileName
    .split(/[/\\]/)
    .pop()!
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/^\.+/, '')
    .slice(0, 120)

  // SVG kabul edilmez: Storage aynı origin'den servis edilirse SVG içine
  // gömülü script depolanmış XSS'e dönüşebilir.
  if (!safeName || !/\.(jpg|jpeg|png|webp|avif)$/i.test(safeName)) {
    throw new Error('Yalnızca JPG, PNG, WEBP ve AVIF görselleri yüklenebilir.')
  }

  return getSignedUploadUrl(safeName)
}

// ─── BRANDS & CATEGORIES ─────────────────────────────────────────────────────

export async function getBrandsForAdmin() {
  await requireAdmin()

  return prisma.brand.findMany({ orderBy: { name: 'asc' } })
}

export async function getCategoriesForAdmin(brandId?: number) {
  await requireAdmin()

  return prisma.category.findMany({
    where: {
      isActive: true,
      ...(brandId ? { brandId } : {}),
    },
    orderBy: [{ brand: { name: 'asc' } }, { sortOrder: 'asc' }],
    include: { brand: true },
  })
}

// ─── PRODUCT LIST ─────────────────────────────────────────────────────────────

export async function getProductsForAdmin(brandKey?: string) {
  await requireAdmin()

  return prisma.product.findMany({
    where: brandKey ? { brand: { key: brandKey } } : undefined,
    include: {
      brand: true,
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
    orderBy: [{ createdAt: 'desc' }],
  })
}

export async function getProductForEdit(id: string) {
  await requireAdmin()

  return prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      specs: { orderBy: { sortOrder: 'asc' } },
      tags: { include: { tag: true } },
    },
  })
}


// ─── ÜRÜN FORMU DOĞRULAMA ────────────────────────────────────────────────────

interface ProductInput {
  slug: string
  name: string
  categoryId: number
  brandId: number
  price: number
  salePrice: number | null
  stockQuantity: number
  unit: string
  sku: string | null
  description: string
  shortDescription: string
  isActive: boolean
  isFeatured: boolean
  productBrand: string | null
  vatRate: number
}

/**
 * Form verisini doğrular.
 *
 * Eskiden `parseFloat(formData.get('price'))` doğrudan Prisma'ya gidiyordu;
 * boş veya geçersiz girdide NaN oluşup "Invalid value" hatasıyla admin genel
 * hata sayfasına düşüyordu.
 */
function parseProductForm(formData: FormData): ProductInput {
  const num = (key: string): number => {
    const raw = (formData.get(key) as string | null)?.trim()
    const value = Number(raw)
    return Number.isFinite(value) ? value : NaN
  }

  const slug = ((formData.get('slug') as string) ?? '').trim().toLowerCase()
  const name = ((formData.get('name') as string) ?? '').trim()
  const categoryId = num('categoryId')
  const brandId = num('brandId')
  const price = num('price')
  const salePriceRaw = (formData.get('salePrice') as string | null)?.trim()
  const stockRaw = (formData.get('stockQuantity') as string | null)?.trim()

  if (!name || name.length < 2) throw new Error('Ürün adı en az 2 karakter olmalıdır.')
  if (name.length > 255) throw new Error('Ürün adı çok uzun (en fazla 255 karakter).')

  if (!slug) throw new Error('Slug (URL adı) zorunludur.')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Slug yalnızca küçük harf, rakam ve tire içerebilir (örn. "taban-gubresi").')
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) throw new Error('Geçerli bir alt kategori seçin.')
  if (!Number.isInteger(brandId) || brandId <= 0) throw new Error('Geçerli bir marka seçin.')

  if (!Number.isFinite(price) || price < 0) throw new Error('Geçerli bir fiyat girin.')
  if (price > 9_999_999) throw new Error('Fiyat çok yüksek.')

  let salePrice: number | null = null
  if (salePriceRaw) {
    const value = Number(salePriceRaw)
    if (!Number.isFinite(value) || value < 0) throw new Error('Geçerli bir indirimli fiyat girin.')
    if (value >= price) throw new Error('İndirimli fiyat, normal fiyattan düşük olmalıdır.')
    salePrice = value
  }

  const stockQuantity = stockRaw ? Number(stockRaw) : 0
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new Error('Stok adedi 0 veya daha büyük bir tam sayı olmalıdır.')
  }

  return {
    slug,
    name,
    categoryId,
    brandId,
    price,
    salePrice,
    stockQuantity,
    unit: ((formData.get('unit') as string) || 'adet').slice(0, 50),
    sku: ((formData.get('sku') as string) || '').trim().slice(0, 100) || null,
    description: ((formData.get('description') as string) || '').slice(0, 20000),
    shortDescription: ((formData.get('shortDescription') as string) || '').slice(0, 1000),
    isActive: formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'true',
    productBrand: ((formData.get('productBrand') as string) || '').trim().slice(0, 100) || null,
    vatRate: [1, 10, 20].includes(Number(formData.get('vatRate')))
      ? Number(formData.get('vatRate'))
      : 20,
  }
}

/** Prisma'nın benzersizlik/ilişki hatalarını okunabilir mesaja çevirir */
function friendlyPrismaError(error: unknown): string {
  const code = (error as { code?: string })?.code
  const target = ((error as { meta?: { target?: string[] } })?.meta?.target ?? []).join(', ')

  if (code === 'P2002') {
    if (target.includes('slug')) return 'Bu slug başka bir üründe kullanılıyor. Farklı bir slug girin.'
    if (target.includes('sku')) return 'Bu SKU başka bir üründe kullanılıyor.'
    return 'Bu değer başka bir kayıtta kullanılıyor.'
  }
  if (code === 'P2003') return 'Seçilen kategori veya marka bulunamadı.'
  if (code === 'P2025') return 'Kayıt bulunamadı.'
  return 'İşlem tamamlanamadı. Lütfen bilgileri kontrol edip tekrar deneyin.'
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  await requireAdmin()

  const imageFile = formData.get('imageFile') as File | null
  let imageUrl = formData.get('imageUrl') as string | null

  // Dosya yükleme
  const input = parseProductForm(formData)

  if (imageFile && imageFile.size > 0) {
    const ext = (imageFile.name.split('.').pop() ?? 'jpg').replace(/[^a-zA-Z0-9]/g, '')
    imageUrl = await uploadProductImage(imageFile, `${input.slug}.${ext}`)
  }

  let product: { id: string }
  try {
    product = await prisma.product.create({
      data: {
        ...input,
        images: imageUrl
          ? {
              create: [{ url: imageUrl, altText: input.name, isPrimary: true, sortOrder: 0 }],
            }
          : undefined,
      },
      select: { id: true },
    })
  } catch (error) {
    console.error('[admin] ürün oluşturulamadı:', error)
    throw new Error(friendlyPrismaError(error))
  }

  // Teknik özellikler
  const specsRaw = formData.get('specs') as string
  if (specsRaw) {
    const specs = JSON.parse(specsRaw) as Array<{ name: string; value: string; unit?: string }>
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i]
      if (s.name && s.value) {
        await prisma.productSpec.create({
          data: {
            productId: product.id,
            specName: s.name,
            specValue: s.value,
            specUnit: s.unit || null,
            sortOrder: i,
          },
        })
      }
    }
  }

  const redirectBrand = (formData.get('redirectBrand') as string) || 'alb-tarim'
  revalidatePath('/admin/urunler')
  revalidatePath(`/alb-tarim/urunler`)
  revalidatePath(`/alb-su-aritma/urunler`)
  redirect(`/admin/urunler/${redirectBrand}`)
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin()

  const imageFile = formData.get('imageFile') as File | null
  let imageUrl = formData.get('imageUrl') as string | null
  const replaceImage = formData.get('replaceImage') === 'true'

  const input = parseProductForm(formData)

  if (imageFile && imageFile.size > 0) {
    const ext = (imageFile.name.split('.').pop() ?? 'jpg').replace(/[^a-zA-Z0-9]/g, '')
    imageUrl = await uploadProductImage(imageFile, `${input.slug}.${ext}`)
  }

  try {
    await prisma.product.update({ where: { id }, data: input })
  } catch (error) {
    console.error('[admin] ürün güncellenemedi:', id, error)
    throw new Error(friendlyPrismaError(error))
  }

  // Kapak görselini güncelle.
  //
  // Önceden burada `deleteMany` ile ürünün TÜM görselleri siliniyordu. Çoklu
  // görsel desteğiyle birlikte bu, formu her kaydedişte galerinin silinmesi
  // anlamına gelirdi. Artık yalnızca kapak değiştirilir; diğer görseller kalır.
  if (imageUrl && replaceImage) {
    const current = await prisma.productImage.findFirst({
      where: { productId: id, isPrimary: true },
      select: { id: true, url: true },
    })

    if (current) {
      if (current.url !== imageUrl) {
        await prisma.productImage.update({
          where: { id: current.id },
          data: { url: imageUrl, altText: input.name },
        })
        // Storage'daki eski dosyayı temizle (public/ içindekilere dokunma)
        if (current.url.includes('supabase')) {
          const fileName = current.url.split('/').pop()
          if (fileName) await deleteProductImage(fileName).catch(() => {})
        }
      }
    } else {
      await prisma.productImage.create({
        data: { productId: id, url: imageUrl, altText: input.name, isPrimary: true, sortOrder: 0 },
      })
    }
  }

  // Teknik özellikler: sil + yeniden oluştur
  const specsRaw = formData.get('specs') as string
  if (specsRaw) {
    const specs = JSON.parse(specsRaw) as Array<{ name: string; value: string; unit?: string }>
    await prisma.productSpec.deleteMany({ where: { productId: id } })
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i]
      if (s.name && s.value) {
        await prisma.productSpec.create({
          data: {
            productId: id,
            specName: s.name,
            specValue: s.value,
            specUnit: s.unit || null,
            sortOrder: i,
          },
        })
      }
    }
  }

  const redirectBrand = (formData.get('redirectBrand') as string) || 'alb-tarim'
  revalidatePath('/admin/urunler')
  revalidatePath(`/alb-tarim/urunler`)
  revalidatePath(`/alb-su-aritma/urunler`)
  redirect(`/admin/urunler/${redirectBrand}`)
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export type DeleteProductResult =
  | { ok: true; archived: false }
  | { ok: true; archived: true; orderCount: number }
  | { ok: false; error: string }

/**
 * Ürünü siler.
 *
 * Siparişi olan ürün SİLİNEMEZ (OrderItem yabancı anahtarı engeller ve geçmiş
 * siparişlerin bozulmaması gerekir) — bu durumda ürün pasife alınır (arşivlenir).
 *
 * Eskiden görseller silme denemesinden ÖNCE Storage'dan kaldırılıyordu; yabancı
 * anahtar hatası verince ürün DB'de kalıyor ama görselleri yok oluyordu.
 */
export async function deleteProduct(id: string): Promise<DeleteProductResult> {
  await requireAdmin()

  // Önce siparişte kullanılmış mı bak — görsellere dokunmadan
  const orderCount = await prisma.orderItem.count({ where: { productId: id } })

  if (orderCount > 0) {
    // Geçmiş siparişleri korumak için sil değil, arşivle
    await prisma.product.update({
      where: { id },
      data: { isActive: false, isFeatured: false },
    })
    revalidatePath('/admin/urunler')
    revalidatePath('/alb-tarim/urunler')
    revalidatePath('/alb-su-aritma/urunler')
    return { ok: true, archived: true, orderCount }
  }

  try {
    // Önce kaydı sil; başarılıysa görselleri temizle
    const images = await prisma.productImage.findMany({ where: { productId: id } })

    await prisma.product.delete({ where: { id } })

    for (const img of images) {
      // Sadece Supabase Storage URL'lerini sil (public/ içindekiler değil)
      if (img.url.includes('supabase')) {
        const fileName = img.url.split('/').pop()
        if (fileName) await deleteProductImage(fileName).catch(() => {})
      }
    }

    revalidatePath('/admin/urunler')
    revalidatePath('/alb-tarim/urunler')
    revalidatePath('/alb-su-aritma/urunler')
    return { ok: true, archived: false }
  } catch (error) {
    console.error('[admin] ürün silinemedi:', id, error)
    return {
      ok: false,
      error: 'Ürün silinemedi. Başka bir kayıtla ilişkili olabilir; pasife almayı deneyin.',
    }
  }
}

// ─── TOGGLE ───────────────────────────────────────────────────────────────────

export async function toggleProductActive(id: string, current: boolean) {
  await requireAdmin()

  await prisma.product.update({ where: { id }, data: { isActive: !current } })
  revalidatePath('/admin/urunler')
}

export async function toggleProductFeatured(id: string, current: boolean) {
  await requireAdmin()

  await prisma.product.update({ where: { id }, data: { isFeatured: !current } })
  revalidatePath('/admin/urunler')
}
