'use server'

import { cookies, headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { prisma, type TransactionClient } from '@/lib/db'
import { verifyAdminToken } from '@/lib/admin-auth'
import { refundPayment, cancelPayment } from '@/lib/iyzico'

/**
 * Admin sipariş yönetimi.
 *
 * Eskiden admin panelinde sipariş bölümü hiç yoktu: sipariş durumu yalnızca
 * ödeme callback'i ile CONFIRMED'a geçiyor, PROCESSING/SHIPPED/DELIVERED
 * durumlarına asla ulaşamıyordu. İade çağrısı da yoktu; müşteri siparişi iptal
 * ediyor ama parası iade edilmiyordu.
 */

const ADMIN_COOKIE = 'admin_session'

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!(await verifyAdminToken(token))) {
    throw new Error('Yetkisiz erişim: admin oturumu gerekli')
  }
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

const VALID_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]

// ─── Listeleme ───────────────────────────────────────────────────────────────

export async function getOrdersForAdmin(options?: {
  status?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  await requireAdmin()

  const page = Math.max(1, options?.page ?? 1)
  const pageSize = Math.min(100, Math.max(10, options?.pageSize ?? 25))
  const status = options?.status
  const search = options?.search?.trim()

  const where: Record<string, unknown> = {}

  if (status && VALID_STATUSES.includes(status as OrderStatus)) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { shipFullName: { contains: search, mode: 'insensitive' } },
      { trackingNumber: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { email: true, name: true, phone: true } },
        brand: { select: { key: true, name: true } },
        items: {
          include: { product: { select: { name: true, unit: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ])

  return { orders, total, page, pageSize, pageCount: Math.ceil(total / pageSize) }
}

export async function getOrderCountsByStatus() {
  await requireAdmin()

  const grouped = await prisma.order.groupBy({
    by: ['status'],
    _count: { status: true },
  })

  const counts: Record<string, number> = {}
  for (const row of grouped as Array<{ status: string; _count: { status: number } }>) {
    counts[row.status] = row._count.status
  }
  return counts
}

// ─── Durum güncelleme ────────────────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin()

  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    throw new Error('Geçersiz sipariş durumu')
  }

  const data: Record<string, unknown> = { status }

  // Durum geçişlerinde tarih damgaları
  if (status === 'SHIPPED') data.shippedAt = new Date()
  if (status === 'DELIVERED') data.deliveredAt = new Date()

  await prisma.order.update({ where: { id: orderId }, data })

  revalidatePath('/admin/siparisler')
  revalidatePath(`/admin/siparisler/${orderId}`)
}

// ─── Kargo bilgisi ───────────────────────────────────────────────────────────

export async function updateOrderShipping(
  orderId: string,
  carrier: string,
  trackingNumber: string,
) {
  await requireAdmin()

  const cleanCarrier = carrier.trim().slice(0, 100)
  const cleanTracking = trackingNumber.trim().slice(0, 100)

  if (!cleanCarrier || !cleanTracking) {
    throw new Error('Kargo firması ve takip numarası gerekli')
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      carrier: cleanCarrier,
      trackingNumber: cleanTracking,
      status: 'SHIPPED',
      shippedAt: new Date(),
    },
  })

  revalidatePath('/admin/siparisler')
  revalidatePath(`/admin/siparisler/${orderId}`)
}

// ─── Admin notu ──────────────────────────────────────────────────────────────

export async function updateOrderNote(orderId: string, note: string) {
  await requireAdmin()

  await prisma.order.update({
    where: { id: orderId },
    data: { adminNote: note.trim().slice(0, 2000) || null },
  })

  revalidatePath(`/admin/siparisler/${orderId}`)
}

// ─── İade ────────────────────────────────────────────────────────────────────

export type RefundResult = { ok: true; message: string } | { ok: false; error: string }

/**
 * Siparişi iade eder: iyzico'ya iade isteği gönderir, stokları geri yükler ve
 * siparişi REFUNDED yapar.
 */
export async function refundOrder(orderId: string): Promise<RefundResult> {
  await requireAdmin()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      paymentId: true,
      totalAmount: true,
      stockReduced: true,
      items: { select: { productId: true, quantity: true } },
    },
  })

  if (!order) return { ok: false, error: 'Sipariş bulunamadı.' }
  if (order.status === 'REFUNDED') return { ok: false, error: 'Bu sipariş zaten iade edilmiş.' }
  if (order.paymentStatus !== 'paid') {
    return { ok: false, error: 'Bu sipariş için tahsil edilmiş bir ödeme yok.' }
  }

  const headerList = await headers()
  const ip = (headerList.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()

  let gatewayMessage = 'Ödeme sağlayıcısına iade isteği gönderilemedi — elle kontrol edin.'

  if (order.paymentId) {
    try {
      // Önce iptal (aynı gün), olmazsa iade
      const cancelled = await cancelPayment({
        paymentId: order.paymentId,
        conversationId: order.id,
        ip,
      })

      if (cancelled?.status === 'success') {
        gatewayMessage = 'Ödeme iptal edildi (aynı gün iptali).'
      } else {
        const refunded = await refundPayment({
          paymentTransactionId: order.paymentId,
          price: Number(order.totalAmount).toFixed(2),
          conversationId: order.id,
          ip,
        })
        gatewayMessage =
          refunded?.status === 'success'
            ? 'İade talebi ödeme sağlayıcısına iletildi.'
            : `İade başarısız: ${refunded?.errorMessage ?? 'bilinmeyen hata'} — elle kontrol edin.`
      }
    } catch (error) {
      console.error('[admin] iade hatası:', orderId, error)
    }
  }

  // Stokları geri yükle + siparişi işaretle
  await prisma.$transaction(async (tx: TransactionClient) => {
    if (order.stockReduced) {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        })
      }
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'REFUNDED',
        paymentStatus: 'refunded',
        stockReduced: false,
      },
    })
  })

  revalidatePath('/admin/siparisler')
  revalidatePath(`/admin/siparisler/${orderId}`)

  return { ok: true, message: gatewayMessage }
}

// ─── Form kayıtları ──────────────────────────────────────────────────────────

export async function getContactMessages(unreadOnly = false) {
  await requireAdmin()

  return prisma.contactMessage.findMany({
    where: unreadOnly ? { isRead: false } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
}

export async function markMessageRead(id: string, isRead: boolean) {
  await requireAdmin()
  await prisma.contactMessage.update({ where: { id }, data: { isRead } })
  revalidatePath('/admin/mesajlar')
}

export async function getDealerApplications() {
  await requireAdmin()

  return prisma.dealerApplication.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
}

export async function updateDealerStatus(id: string, status: string) {
  await requireAdmin()

  const allowed = ['new', 'contacted', 'approved', 'rejected']
  if (!allowed.includes(status)) throw new Error('Geçersiz durum')

  await prisma.dealerApplication.update({ where: { id }, data: { status } })
  revalidatePath('/admin/bayi-basvurulari')
}
