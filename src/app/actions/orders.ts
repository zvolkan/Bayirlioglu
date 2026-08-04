'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { prisma, type TransactionClient } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { processRefund } from '@/lib/refund'

// ─── Oturum kontrolü ─────────────────────────────────────────────────────────

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')
  return user
}

// ─── Kullanıcının sipariş listesi ─────────────────────────────────────────────

export async function getUserOrders() {
  const user = await getAuthUser()

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      brand: { select: { name: true, key: true } },
      address: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              salePrice: true,
              unit: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders
}

// ─── Son siparişi getir ───────────────────────────────────────────────────────

export async function getLastOrder(brandKey?: string) {
  const user = await getAuthUser()

  const order = await prisma.order.findFirst({
    where: {
      userId: user.id,
      ...(brandKey ? { brand: { key: brandKey } } : {}),
    },
    include: {
      brand: { select: { name: true, key: true } },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              salePrice: true,
              unit: true,
              isActive: true,
              stockQuantity: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return order
}

// ─── Sipariş oluştur ──────────────────────────────────────────────────────────

export type CreateOrderInput = {
  brandId: number
  addressId?: string
  notes?: string
  paymentMethod?: string
  items: { productId: string; quantity: number; unitPrice: number }[]
}

export async function createOrder(input: CreateOrderInput) {
  const user = await getAuthUser()

  const totalAmount = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      brandId: input.brandId,
      addressId: input.addressId ?? null,
      notes: input.notes ?? null,
      paymentMethod: input.paymentMethod ?? null,
      totalAmount,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })),
      },
    },
  })

  revalidatePath('/hesabim')
  return order
}

// ─── Son siparişi tekrarla — sepete ekle ─────────────────────────────────────
// Geçen yılın siparişindeki ürünleri (aktif ve stokta olanları) döndürür.
// Frontend bu listeyi sepete ekleyecek.

export async function getRepeatOrderItems(orderId: string) {
  const user = await getAuthUser()

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              salePrice: true,
              unit: true,
              isActive: true,
              stockQuantity: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
  })

  if (!order) return null

  // Sadece hâlâ aktif ve stokta olan ürünleri döndür
  const available = order.items.filter(
    (item) => item.product.isActive && item.product.stockQuantity > 0
  )

  return {
    orderId: order.id,
    createdAt: order.createdAt,
    available,
    unavailable: order.items.filter(
      (item) => !item.product.isActive || item.product.stockQuantity === 0
    ),
  }
}

// ─── Sipariş iptal et ────────────────────────────────────────────────────────

export type CancelOrderResult = { ok: true; message: string } | { ok: false; error: string }

/**
 * Müşterinin sipariş iptali.
 *
 * ÖNEMLİ: Ödemesi alınmış (CONFIRMED) bir sipariş iptal edilirken önce para
 * iade edilir ve stoklar geri yüklenir. Eskiden yalnızca durum CANCELLED
 * yapılıyordu: müşterinin parası iade edilmiyor, düşülen stok da geri
 * gelmiyordu.
 */
export async function cancelOrder(orderId: string): Promise<CancelOrderResult> {
  const user = await getAuthUser()

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    select: { id: true, status: true, paymentStatus: true },
  })

  if (!order) return { ok: false, error: 'Sipariş bulunamadı.' }

  const cancellable = ['PENDING', 'CONFIRMED']
  if (!cancellable.includes(order.status)) {
    return {
      ok: false,
      error: 'Bu sipariş hazırlanmaya başlandığı için artık iptal edilemiyor.',
    }
  }

  // Ödemesi alınmışsa iade akışından geçir
  if (order.paymentStatus === 'paid') {
    const headerList = await headers()
    const ip = (headerList.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()

    const result = await processRefund({
      orderId,
      ip,
      reason: 'Müşteri talebiyle iptal',
    })

    revalidatePath('/hesabim/siparislerim')
    revalidatePath('/hesabim')

    if (!result.ok) {
      return {
        ok: false,
        error:
          'İptal işlemi tamamlanamadı. Lütfen bizimle iletişime geçin, siparişinizi ekibimiz iptal edecek.',
      }
    }

    return {
      ok: true,
      message:
        'Siparişiniz iptal edildi. Ödemeniz bankanıza iade edildi; hesabınıza yansıması 1-7 iş günü sürebilir.',
    }
  }

  // Ödeme alınmamış (PENDING) sipariş — doğrudan iptal
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED', paymentStatus: 'cancelled' },
  })

  revalidatePath('/hesabim/siparislerim')
  revalidatePath('/hesabim')

  return { ok: true, message: 'Siparişiniz iptal edildi.' }
}

// ─── Profil güncelle ─────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const user = await getAuthUser()

  const name = ((formData.get('name') as string) ?? '').trim().slice(0, 150)
  const phone = ((formData.get('phone') as string) ?? '').trim().slice(0, 20)

  if (name && name.length < 2) throw new Error('Ad soyad en az 2 karakter olmalıdır.')
  if (phone && phone.replace(/\D/g, '').length < 10) {
    throw new Error('Geçerli bir telefon numarası girin.')
  }

  // Kullanıcı satırı yoksa oluştur — Supabase kaydı ile DB senkron değilse
  // update P2025 hatası verip 500 dönüyordu.
  await prisma.user.upsert({
    where: { id: user.id },
    update: { name: name || null, phone: phone || null },
    create: {
      id: user.id,
      email: user.email ?? '',
      name: name || null,
      phone: phone || null,
    },
  })

  revalidatePath('/hesabim')
}


// ─── Adres doğrulama ─────────────────────────────────────────────────────────

interface AddressInput {
  label: string
  fullName: string
  phone: string
  line1: string
  line2: string | null
  district: string
  city: string
  postalCode: string | null
}

/**
 * Adres formunu doğrular ve sütun sınırlarına kırpar.
 * Eskiden `formData.get(...) as string` doğrudan Prisma'ya gidiyordu; boş alan
 * null hatası, uzun alan da P2000 ("value too long") hatası veriyordu.
 */
function parseAddressForm(formData: FormData): AddressInput {
  const text = (key: string, max: number) =>
    ((formData.get(key) as string | null) ?? '').trim().slice(0, max)

  const fullName = text('fullName', 150)
  const phone = text('phone', 20)
  const line1 = text('line1', 255)
  const district = text('district', 100)
  const city = text('city', 100)

  if (fullName.length < 2) throw new Error('Ad soyad en az 2 karakter olmalıdır.')
  if (phone.replace(/\D/g, '').length < 10) throw new Error('Geçerli bir telefon numarası girin.')
  if (line1.length < 5) throw new Error('Adres en az 5 karakter olmalıdır.')
  if (district.length < 2) throw new Error('İlçe bilgisi gereklidir.')
  if (city.length < 2) throw new Error('İl bilgisi gereklidir.')

  return {
    label: text('label', 50) || 'Adresim',
    fullName,
    phone,
    line1,
    line2: text('line2', 255) || null,
    district,
    city,
    postalCode: text('postalCode', 10) || null,
  }
}

// ─── Adres ekle ──────────────────────────────────────────────────────────────

export async function addAddress(formData: FormData) {
  const user = await getAuthUser()

  const input = parseAddressForm(formData)
  const isDefault = formData.get('isDefault') === 'on'

  // İlk adres otomatik varsayılan olsun
  const existingCount = await prisma.address.count({ where: { userId: user.id } })
  const makeDefault = isDefault || existingCount === 0

  // Varsayılan sıfırlama + oluşturma tek transaction: biri başarısız olursa
  // kullanıcı varsayılan adressiz kalmasın
  await prisma.$transaction(async (tx: TransactionClient) => {
    if (makeDefault) {
      await tx.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      })
    }

    await tx.address.create({
      data: { ...input, userId: user.id, isDefault: makeDefault },
    })
  })

  revalidatePath('/hesabim')
  revalidatePath('/hesabim/adreslerim')
}

// ─── Adres güncelle ──────────────────────────────────────────────────────────

export async function updateAddress(addressId: string, formData: FormData) {
  const user = await getAuthUser()

  const isDefault = formData.get('isDefault') === 'on'

  await prisma.$transaction(async (tx: TransactionClient) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      })
    }

    await tx.address.updateMany({
      where: { id: addressId, userId: user.id },
      data: {
      label: (formData.get('label') as string) || 'Adresim',
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      line1: formData.get('line1') as string,
      line2: (formData.get('line2') as string) || null,
      district: formData.get('district') as string,
      city: formData.get('city') as string,
        postalCode: (formData.get('postalCode') as string) || null,
        isDefault,
      },
    })
  })

  revalidatePath('/hesabim')
  revalidatePath('/hesabim/adreslerim')
}

// ─── Adres sil ────────────────────────────────────────────────────────────────

export async function deleteAddress(addressId: string) {
  const user = await getAuthUser()

  const deleted = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
    select: { isDefault: true },
  })

  await prisma.address.deleteMany({
    where: { id: addressId, userId: user.id },
  })

  // Varsayılan adres silindiyse kalanlardan birini varsayılan yap
  if (deleted?.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } })
    }
  }

  revalidatePath('/hesabim')
  revalidatePath('/hesabim/adreslerim')
}

// ─── Varsayılan adres yap ─────────────────────────────────────────────────────

export async function setDefaultAddress(addressId: string) {
  const user = await getAuthUser()

  const owned = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
    select: { id: true },
  })
  if (!owned) return

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ])

  revalidatePath('/hesabim')
  revalidatePath('/hesabim/adreslerim')
}
