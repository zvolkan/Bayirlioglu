'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma, type TransactionClient } from '@/lib/db'
import { revalidatePath } from 'next/cache'

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

export async function cancelOrder(orderId: string) {
  const user = await getAuthUser()

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    select: { id: true, status: true },
  })

  if (!order) throw new Error('Sipariş bulunamadı.')

  const cancellable = ['PENDING', 'CONFIRMED']
  if (!cancellable.includes(order.status)) {
    throw new Error('Bu sipariş kargoya verildiği için artık iptal edilemiyor.')
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
  })

  revalidatePath('/hesabim/siparislerim')
  revalidatePath('/hesabim')
}

// ─── Profil güncelle ─────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const user = await getAuthUser()

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string

  await prisma.user.update({
    where: { id: user.id },
    data: { name, phone },
  })

  revalidatePath('/hesabim')
}

// ─── Adres ekle ──────────────────────────────────────────────────────────────

export async function addAddress(formData: FormData) {
  const user = await getAuthUser()

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
      data: {
        userId: user.id,
        label: (formData.get('label') as string) || 'Adresim',
        fullName: formData.get('fullName') as string,
        phone: formData.get('phone') as string,
        line1: formData.get('line1') as string,
        line2: (formData.get('line2') as string) || null,
        district: formData.get('district') as string,
        city: formData.get('city') as string,
        postalCode: (formData.get('postalCode') as string) || null,
        isDefault: makeDefault,
      },
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
