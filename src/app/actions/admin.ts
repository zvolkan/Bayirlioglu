'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { uploadProductImage, deleteProductImage, getSignedUploadUrl } from '@/lib/supabase-admin'

const ADMIN_COOKIE = 'admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 saat

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function adminLogin(formData: FormData) {
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirect') as string) || '/admin/urunler'

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/giris?error=1')
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, 'authenticated', {
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
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE)?.value
  if (!session || session !== 'authenticated') throw new Error('Yetkisiz erişim')
  return getSignedUploadUrl(fileName)
}

// ─── BRANDS & CATEGORIES ─────────────────────────────────────────────────────

export async function getBrandsForAdmin() {
  return prisma.brand.findMany({ orderBy: { name: 'asc' } })
}

export async function getCategoriesForAdmin(brandId?: number) {
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
  await prisma.product.update({ where: { id }, data: { isActive: !current } })
  revalidatePath('/admin/urunler')
}

export async function toggleProductFeatured(id: string, current: boolean) {
  await prisma.product.update({ where: { id }, data: { isFeatured: !current } })
  revalidatePath('/admin/urunler')
}
