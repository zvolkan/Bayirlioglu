import { prisma } from '@/lib/db'
import { approvePaymentItem } from '@/lib/iyzico'

/**
 * Teslimat bildirimi (Korumalı Alışveriş kalem onayı).
 *
 * ÖNEMLİ — bu her hesapta gerekli DEĞİL:
 *
 * iyzico'nun standart tek satıcılı akışında "teslim edildi" diye bir bildirim
 * adımı yoktur. Ödeme alındıktan sonra para, hesabınızın ödeme takvimine göre
 * otomatik olarak aktarılır (panelde görünen "Para Gönderilecek Tarih" budur).
 *
 * Bildirim yalnızca **Korumalı Alışveriş** modeli açık olan hesaplarda
 * anlamlıdır. Orada para, satıcı kalemi onaylayana kadar iyzico'da bekletilir;
 * onay gelmezse belirli süre sonra alıcıya iade edilir.
 *
 * Bu yüzden özellik `IYZICO_KORUMALI_ALISVERIS=true` ortam değişkeniyle
 * KAPALI geliyor. Hesabınızda Korumalı Alışveriş açıksa değişkeni tanımlayın;
 * değilse dokunmayın — kapalıyken hiçbir istek gönderilmiyor.
 */

export type DeliveryApprovalOutcome =
  | { attempted: false }
  | { attempted: true; approved: number; failed: number; note: string | null }

function isEnabled(): boolean {
  return (process.env.IYZICO_KORUMALI_ALISVERIS ?? '').trim().toLowerCase() === 'true'
}

/**
 * Siparişin tüm kalemlerini iyzico'da onaylar.
 *
 * Hiçbir koşulda hata fırlatmaz: teslimat durumunun kaydedilmesi bu isteğe
 * bağlı olmamalı. Başarısızlık siparişin yönetici notuna yazılır.
 */
export async function approveDeliveredOrder(orderId: string): Promise<DeliveryApprovalOutcome> {
  if (!isEnabled()) return { attempted: false }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        paymentStatus: true,
        items: { select: { id: true, paymentTransactionId: true } },
      },
    })

    if (!order || order.paymentStatus !== 'paid') return { attempted: false }

    const items = order.items.filter(
      (i: { paymentTransactionId: string | null }) => Boolean(i.paymentTransactionId),
    )

    if (items.length === 0) {
      return {
        attempted: true,
        approved: 0,
        failed: 0,
        note:
          'iyzico teslimat onayı gönderilemedi: bu siparişte kalem işlem kimliği yok. ' +
          'Kimlik, ödeme geri dönüşünde kaydediliyor; bu sipariş o özellik eklenmeden önce oluşturulmuş. ' +
          'Korumalı Alışveriş kullanıyorsanız iyzico panelinden elle onaylayın.',
      }
    }

    let approved = 0
    const errors: string[] = []

    for (const item of items) {
      try {
        const result = await approvePaymentItem({
          paymentTransactionId: item.paymentTransactionId!,
          conversationId: order.id,
        })

        if (result?.status === 'success') {
          approved++
        } else {
          errors.push(String(result?.errorMessage ?? 'bilinmeyen hata'))
        }
      } catch (error) {
        errors.push(String(error).slice(0, 120))
      }
    }

    const failed = items.length - approved

    return {
      attempted: true,
      approved,
      failed,
      note:
        failed > 0
          ? `iyzico teslimat onayı kısmen başarısız: ${approved}/${items.length} kalem onaylandı. Hata: ${errors
              .slice(0, 2)
              .join(' | ')}`
          : null,
    }
  } catch (error) {
    console.error('[iyzico] teslimat onayı başarısız:', orderId, error)
    return {
      attempted: true,
      approved: 0,
      failed: 0,
      note: `iyzico teslimat onayı gönderilemedi: ${String(error).slice(0, 150)}`,
    }
  }
}
