'use server'

import { cookies, headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { prisma, type TransactionClient } from '@/lib/db'
import { verifyAdminToken } from '@/lib/admin-auth'
import { processRefund } from '@/lib/refund'
import {
  notifyOrderShipped,
  notifyOrderDelivered,
  notifyOrderCancelled,
} from '@/lib/email/notify'

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

/**
 * Elle seçilebilen durumlar. REFUNDED listede YOK: iade, para gerçekten iade
 * edilmeden işaretlenirse geri alınamaz bir tutarsızlık oluşuyordu. İade
 * yalnızca `refundOrder` akışından geçer.
 */
const MANUAL_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
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

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<OrderStatusResult> {
  await requireAdmin()

  if (!MANUAL_STATUSES.includes(status as OrderStatus)) {
    return {
      ok: false,
      error:
        status === 'REFUNDED'
          ? 'İade işlemi durum menüsünden yapılamaz. "Siparişi İade Et" butonunu kullanın.'
          : 'Geçersiz sipariş durumu.',
    }
  }

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true, status: true },
  })
  if (!existing) return { ok: false, error: 'Sipariş bulunamadı.' }

  // ── Ödemesi alınmış siparişin iptali = iade ──────────────────────────────
  //
  // Durum menüsünden "İptal Edildi" seçmek eskiden yalnızca durumu yazıyordu:
  // müşterinin parası hesapta kalıyor, düşülen stok geri gelmiyordu. Sonra bu
  // yolu hata fırlatarak kapatmıştım — ama sunucu aksiyonundan fırlatılan hata
  // üretimde mesajı gizlenmiş genel bir hataya dönüşüyor, yönetici de "bir
  // şeyler ters gitti" ekranı görüyordu.
  //
  // Doğrusu: iptal seçildiğinde iyzico'ya iptal/iade isteğini KENDİMİZ
  // göndermek. `processRefund` önce aynı gün iptalini (cancel), o olmazsa
  // iadeyi (refund) deniyor; stokları geri yüklüyor ve müşteriye e-posta
  // atıyor. Gateway başarısız olursa sipariş iade edilmiş sayılmıyor.
  if (status === 'CANCELLED' && existing.paymentStatus === 'paid') {
    const headerList = await headers()
    const ip = (headerList.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()

    const result = await processRefund({
      orderId,
      ip,
      reason: 'Sipariş yönetici tarafından iptal edildi.',
    })

    revalidatePath('/admin/siparisler')
    revalidatePath(`/admin/siparisler/${orderId}`)

    if (!result.ok) {
      return {
        ok: false,
        error: result.needsManualReview
          ? `${result.error} Sipariş iptal edilmedi — iyzico panelinden kontrol edip elle iade edin.`
          : result.error,
      }
    }

    return {
      ok: true,
      // `processRefund` siparişi REFUNDED olarak işaretliyor (para geri
      // döndüğü için doğrusu bu). Yönetici "İptal Edildi" seçtiği hâlde satırda
      // "İade Edildi" göreceği için mesajda açıkça söyleniyor.
      message:
        result.gateway === 'cancel'
          ? 'Ödeme iyzico üzerinden iptal edildi (aynı gün iptali), stoklar geri yüklendi. Sipariş "İade Edildi" olarak işaretlendi.'
          : 'Ödeme iyzico üzerinden iade edildi, stoklar geri yüklendi. Sipariş "İade Edildi" olarak işaretlendi; kartına yansıması 1-7 iş günü sürebilir.',
    }
  }

  const data: Record<string, unknown> = { status }

  // Durum geçişlerinde tarih damgaları
  if (status === 'SHIPPED') data.shippedAt = new Date()
  if (status === 'DELIVERED') data.deliveredAt = new Date()

  await prisma.order.update({ where: { id: orderId }, data })

  // Müşteri bildirimleri — durum gerçekten değiştiyse, tekrar tekrar
  // gönderilmesin diye önceki durumla karşılaştırılıyor.
  if (existing.status !== status) {
    if (status === 'SHIPPED') await notifyOrderShipped(orderId)
    if (status === 'DELIVERED') await notifyOrderDelivered(orderId)
    if (status === 'CANCELLED') await notifyOrderCancelled(orderId)
  }

  revalidatePath('/admin/siparisler')
  revalidatePath(`/admin/siparisler/${orderId}`)

  return { ok: true, message: 'Sipariş durumu güncellendi.' }
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

  // Müşteriye takip numarasını gönder
  await notifyOrderShipped(orderId)

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

export type OrderStatusResult = { ok: true; message: string } | { ok: false; error: string }

export type RefundResult = { ok: true; message: string } | { ok: false; error: string }

/**
 * Siparişi iade eder: iyzico'ya iade isteği gönderir, stokları geri yükler ve
 * siparişi REFUNDED yapar.
 */
export async function refundOrder(
  orderId: string,
  options?: { force?: boolean; reason?: string },
): Promise<RefundResult> {
  await requireAdmin()

  const headerList = await headers()
  const ip = (headerList.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()

  const result = await processRefund({
    orderId,
    ip,
    force: options?.force,
    reason: options?.reason,
  })

  revalidatePath('/admin/siparisler')
  revalidatePath(`/admin/siparisler/${orderId}`)

  if (!result.ok) return { ok: false, error: result.error }
  return { ok: true, message: result.message }
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
