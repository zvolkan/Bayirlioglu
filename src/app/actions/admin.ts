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

  if (!safeName || !/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(safeName)) {
    throw new Error('Geçersiz dosya adı veya desteklenmeyen uzantı')
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

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  await requireAdmin()

  const imageFile = formData.get('imageFile') as File | null
  let imageUrl = formData.get('imageUrl') as string | null

  // Dosya yükleme
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const slug = (formData.get('slug') as string) || `urun-${Date.now()}`
    const fileName = `${slug}.${ext}`
    imageUrl = await uploadProductImage(imageFile, fileName)
  }

  const slug = formData.get('slug') as string
  const name = formData.get('name') as string
  const categoryId = parseInt(formData.get('categoryId') as string)
  const brandId = parseInt(formData.get('brandId') as string)
  const price = parseFloat(formData.get('price') as string)
  const salePrice = formData.get('salePrice') ? parseFloat(formData.get('salePrice') as string) : null
  const stockQuantity = parseInt(formData.get('stockQuantity') as string) || 0
  const unit = (formData.get('unit') as string) || 'adet'
  const sku = (formData.get('sku') as string) || null
  const description = (formData.get('description') as string) || ''
  const shortDescription = (formData.get('shortDescription') as string) || ''
  const isActive = formData.get('isActive') === 'true'
  const isFeatured = formData.get('isFeatured') === 'true'
  const productBrand = (formData.get('productBrand') as string) || null

  const product = await prisma.product.create({
    data: {
      slug,
      name,
      categoryId,
      brandId,
      price,
      salePrice,
      stockQuantity,
      unit,
      sku,
      description,
      shortDescription,
      isActive,
      isFeatured,
      productBrand,
      images: imageUrl
        ? {
            create: [{ url: imageUrl, altText: name, isPrimary: true, sortOrder: 0 }],
          }
        : undefined,
    },
  })

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

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const slug = (formData.get('slug') as string) || id
    const fileName = `${slug}.${ext}`
    imageUrl = await uploadProductImage(imageFile, fileName)
  }

  const slug = formData.get('slug') as string
  const name = formData.get('name') as string
  const categoryId = parseInt(formData.get('categoryId') as string)
  const brandId = parseInt(formData.get('brandId') as string)
  const price = parseFloat(formData.get('price') as string)
  const salePrice = formData.get('salePrice') ? parseFloat(formData.get('salePrice') as string) : null
  const stockQuantity = parseInt(formData.get('stockQuantity') as string) || 0
  const unit = (formData.get('unit') as string) || 'adet'
  const sku = (formData.get('sku') as string) || null
  const description = (formData.get('description') as string) || ''
  const shortDescription = (formData.get('shortDescription') as string) || ''
  const isActive = formData.get('isActive') === 'true'
  const isFeatured = formData.get('isFeatured') === 'true'
  const productBrand = (formData.get('productBrand') as string) || null

  await prisma.product.update({
    where: { id },
    data: {
      slug,
      name,
      categoryId,
      brandId,
      price,
      salePrice,
      stockQuantity,
      unit,
      sku,
      description,
      shortDescription,
      isActive,
      isFeatured,
      productBrand,
    },
  })

  // Görsel güncelle
  if (imageUrl && replaceImage) {
    await prisma.productImage.deleteMany({ where: { productId: id } })
    await prisma.productImage.create({
      data: { productId: id, url: imageUrl, altText: name, isPrimary: true, sortOrder: 0 },
    })
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

export async function deleteProduct(id: string) {
  await requireAdmin()

  // Storage'dan görselleri de sil (Supabase Storage)
  const images = await prisma.productImage.findMany({ where: { productId: id } })
  for (const img of images) {
    // Sadece Supabase Storage URL'lerini sil (public/ içindekiler değil)
    if (img.url.includes('supabase')) {
      const fileName = img.url.split('/').pop()
      if (fileName) await deleteProductImage(fileName).catch(() => {})
    }
  }

  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin/urunler')
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
