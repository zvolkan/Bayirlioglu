import { prisma, type TransactionClient } from '@/lib/db'
import { refundPayment, cancelPayment } from '@/lib/iyzico'
import { notifyOrderRefunded } from '@/lib/email/notify'

/**
 * Sipariş iadesi — TEK KAYNAK.
 *
 * Hem admin panelindeki "İade Et" butonu hem de müşterinin ödenmiş siparişi
 * iptal etmesi buradan geçer. Eskiden müşteri iptali hiçbir iade çağrısı
 * yapmıyor, stokları da geri yüklemiyordu.
 *
 * Kritik kural: **gateway başarısız olursa sipariş REFUNDED işaretlenmez.**
 * Aksi hâlde para müşteriye dönmeden sipariş "iade edildi" görünür ve durum
 * geri alınamaz hâle gelirdi.
 */

export type RefundOutcome =
  | { ok: true; message: string; gateway: 'cancel' | 'refund' }
  | { ok: false; error: string; needsManualReview: boolean }

interface RefundOptions {
  orderId: string
  ip?: string
  /** Gateway başarısız olsa bile siparişi REFUNDED yap (yalnızca admin, elle iade sonrası) */
  force?: boolean
  /** İade sebebi — admin notuna yazılır */
  reason?: string
}

export async function processRefund(options: RefundOptions): Promise<RefundOutcome> {
  const { orderId, ip = '127.0.0.1', force = false, reason } = options

  // ── Kilitle: yalnızca ödenmiş ve henüz iade edilmemiş siparişi işleme al ──
  // Bu koşullu güncelleme, iki sekmeden aynı anda basılan "İade Et" butonunun
  // çift iadeye ve çift stok artışına yol açmasını engeller.
  const claimed = await prisma.order.updateMany({
    where: {
      id: orderId,
      paymentStatus: 'paid',
      status: { not: 'REFUNDED' },
    },
    data: { paymentStatus: 'refunding' },
  })

  if (claimed.count === 0) {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, paymentStatus: true },
    })

    if (!existing) return { ok: false, error: 'Sipariş bulunamadı.', needsManualReview: false }
    if (existing.status === 'REFUNDED' || existing.paymentStatus === 'refunded') {
      return { ok: false, error: 'Bu sipariş zaten iade edilmiş.', needsManualReview: false }
    }
    if (existing.paymentStatus === 'refunding') {
      return {
        ok: false,
        error: 'Bu sipariş için iade işlemi hâlihazırda sürüyor.',
        needsManualReview: false,
      }
    }
    return {
      ok: false,
      error: 'Bu sipariş için tahsil edilmiş bir ödeme yok.',
      needsManualReview: false,
    }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      paymentId: true,
      totalAmount: true,
      stockReduced: true,
      items: { select: { productId: true, quantity: true } },
    },
  })

  if (!order) {
    return { ok: false, error: 'Sipariş bulunamadı.', needsManualReview: false }
  }

  /** Başarısızlıkta kilidi bırak — sipariş tekrar denenebilir kalsın */
  async function releaseLock(note?: string) {
    await prisma.order
      .update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          ...(note ? { adminNote: note } : {}),
        },
      })
      .catch((e) => console.error('[iade] kilit bırakılamadı:', orderId, e))
  }

  // ── Gateway ──────────────────────────────────────────────────────────────
  let gateway: 'cancel' | 'refund' | null = null
  let gatewayError = 'Ödeme sağlayıcısına ulaşılamadı.'

  if (!order.paymentId) {
    if (!force) {
      await releaseLock(
        'İade denendi ancak siparişte ödeme kimliği (paymentId) yok. Ödeme iyzico panelinden elle iade edilmeli.',
      )
      return {
        ok: false,
        error:
          'Bu siparişte ödeme kimliği kayıtlı değil; otomatik iade yapılamıyor. iyzico panelinden elle iade edip "elle iade edildi" seçeneğiyle işaretleyin.',
        needsManualReview: true,
      }
    }
  } else {
    const amount = Number(order.totalAmount).toFixed(2)

    // Önce aynı gün iptali (komisyon iadesi de alınır), olmazsa iade
    try {
      const cancelled = await cancelPayment({
        paymentId: order.paymentId,
        conversationId: order.id,
        ip,
      })
      if (cancelled?.status === 'success') gateway = 'cancel'
      else if (cancelled?.errorMessage) gatewayError = String(cancelled.errorMessage)
    } catch (error) {
      // Ağ/istisna hatası iadeyi engellemesin — aşağıda refund denenir
      console.error('[iade] iptal çağrısı başarısız:', orderId, error)
    }

    if (!gateway) {
      try {
        const refunded = await refundPayment({
          paymentId: order.paymentId,
          price: amount,
          conversationId: order.id,
          ip,
        })
        if (refunded?.status === 'success') gateway = 'refund'
        else if (refunded?.errorMessage) gatewayError = String(refunded.errorMessage)
      } catch (error) {
        console.error('[iade] iade çağrısı başarısız:', orderId, error)
      }
    }

    if (!gateway && !force) {
      await releaseLock(`İade başarısız: ${gatewayError} (${new Date().toISOString()})`)
      return {
        ok: false,
        error: `Ödeme sağlayıcısı iadeyi reddetti: ${gatewayError}. Sipariş değiştirilmedi; iyzico panelinden kontrol edin.`,
        needsManualReview: true,
      }
    }
  }

  // ── Stokları geri yükle + siparişi kapat ─────────────────────────────────
  try {
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
          adminNote: [
            reason ? `İade sebebi: ${reason}` : null,
            gateway === 'cancel'
              ? 'Ödeme aynı gün iptaliyle iade edildi.'
              : gateway === 'refund'
                ? 'Ödeme iyzico üzerinden iade edildi.'
                : 'Elle iade olarak işaretlendi (gateway çağrısı yapılmadı/başarısız).',
          ]
            .filter(Boolean)
            .join(' · ')
            .slice(0, 2000),
        },
      })
    })
  } catch (error) {
    console.error('[iade] DB güncellenemedi (para iade EDİLDİ):', orderId, error)
    return {
      ok: false,
      error:
        'Para iade edildi ancak sipariş kaydı güncellenemedi. Lütfen siparişi elle kontrol edin.',
      needsManualReview: true,
    }
  }

  // Müşteriye iade bildirimi — gönderilemezse iade yine de geçerli
  await notifyOrderRefunded(orderId, reason)

  return {
    ok: true,
    gateway: gateway ?? 'refund',
    message:
      gateway === 'cancel'
        ? 'Ödeme iptal edildi, tutar müşteriye iade edilecek.'
        : gateway === 'refund'
          ? 'İade talebi iyzico’ya iletildi, tutar müşteriye iade edilecek.'
          : 'Sipariş elle iade edilmiş olarak işaretlendi.',
  }
}
