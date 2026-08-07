import { NextRequest, NextResponse } from 'next/server'
import { retrieveCheckoutForm } from '@/lib/iyzico'
import { prisma, type TransactionClient } from '@/lib/db'
import { getSiteUrl } from '@/lib/site-url'
import { notifyOrderConfirmed } from '@/lib/email/notify'

/**
 * iyzico ödeme geri dönüşü.
 *
 * ÖNEMLİ: iyzico buraya POST atar. `NextResponse.redirect` varsayılan olarak
 * 307 döner ve 307 HTTP metodunu KORUR — yani tarayıcı sonuç sayfasına da POST
 * atar ve App Router sayfası POST kabul etmediği için 405 hatası verir.
 * Bu yüzden 303 (See Other) kullanılıyor: tarayıcıyı GET'e zorlar.
 */
function redirectGet(url: string) {
  return NextResponse.redirect(url, 303)
}

export async function POST(req: NextRequest) {
  const siteUrl = getSiteUrl()
  let token: string | null = null

  // ── Token al ──────────────────────────────────────────────────────────────
  try {
    const contentType = req.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const body = await req.json()
      token = body.token
    } else {
      const formData = await req.formData()
      token = formData.get('token') as string
    }
  } catch (e) {
    console.error('[callback] token okunamadı:', e)
    return redirectGet(`${siteUrl}/odeme/basarisiz?hata=token`)
  }

  if (!token) {
    return redirectGet(`${siteUrl}/odeme/basarisiz?hata=token`)
  }

  // ── Siparişi bul ──────────────────────────────────────────────────────────
  let order: {
    id: string
    orderNumber: string | null
    status: string
    paymentStatus: string | null
    totalAmount: unknown
    stockReduced: boolean
  } | null = null

  try {
    order = await prisma.order.findFirst({
      where: { paymentToken: token },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        stockReduced: true,
      },
    })
  } catch (e) {
    console.error('[callback] sipariş sorgulanamadı:', e)
    return redirectGet(`${siteUrl}/odeme/basarisiz?hata=sistem`)
  }

  if (!order) {
    return redirectGet(`${siteUrl}/odeme/basarisiz?hata=siparis`)
  }

  // ── Idempotency: aynı callback ikinci kez gelirse yeniden işleme ─────────
  if (order.paymentStatus === 'paid') {
    return redirectGet(`${siteUrl}/odeme/basarili?siparis=${order.id}`)
  }
  if (order.status === 'CANCELLED') {
    return redirectGet(`${siteUrl}/odeme/basarisiz?hata=odeme`)
  }

  // ── iyzico doğrulama ──────────────────────────────────────────────────────
  try {
    // conversationId ödeme başlatılırken sipariş numarasıyla gönderilmişti
    const result = await retrieveCheckoutForm(token, order.orderNumber ?? order.id)

    const success = result?.status === 'success' && result?.paymentStatus === 'SUCCESS'

    if (!success) {
      console.warn('[callback] ödeme başarısız:', order.id, result?.errorCode, result?.errorMessage)
      await prisma.order
        .update({
          where: { id: order.id },
          data: { status: 'CANCELLED', paymentStatus: 'failed' },
        })
        .catch((e) => console.error('[callback] iptal kaydedilemedi:', order!.id, e))
      return redirectGet(`${siteUrl}/odeme/basarisiz?hata=odeme`)
    }

    // Tahsil edilen tutar sipariş tutarıyla uyuşuyor mu?
    const expected = Number(order.totalAmount)
    const paid = Number(result?.paidPrice ?? 0)
    if (Number.isFinite(paid) && Math.abs(paid - expected) > 0.05) {
      console.error(
        `[callback] TUTAR UYUŞMAZLIĞI sipariş=${order.id} beklenen=${expected} ödenen=${paid}`,
      )
      // Para tahsil edildiği için siparişi iptal etmiyoruz; incelenmek üzere
      // işaretliyoruz.
      await prisma.order
        .update({
          where: { id: order.id },
          data: {
            adminNote: `Tutar uyuşmazlığı: beklenen ${expected} TL, tahsil edilen ${paid} TL. İnceleme gerekiyor.`,
          },
        })
        .catch(() => {})
    }

    // ── ÖNCE siparişi onayla ─────────────────────────────────────────────
    // Para tahsil edildi; bu kaydın atılmaması her şeyden önemli. Tek başına
    // ve hızlı bir güncelleme olduğu için transaction'a sokulmuyor.
    const confirmed = await prisma.order.updateMany({
      where: { id: order.id, paymentStatus: { not: 'paid' } },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'paid',
        paymentId: result?.paymentId ? String(result.paymentId) : null,
      },
    })

    // ── iyzico kalem işlem kimliklerini sakla ────────────────────────────
    // Korumalı Alışveriş teslimat onayı ve kalem bazlı iade bu kimliği
    // istiyor; sonradan hiçbir yerden öğrenilemiyor, yalnızca burada geliyor.
    // Sipariş onayını bozmaması için ayrı ve sessiz bir blokta.
    try {
      const transactions = Array.isArray(result?.itemTransactions)
        ? (result.itemTransactions as Array<{ itemId?: string; paymentTransactionId?: string }>)
        : []

      for (const tx of transactions) {
        if (!tx.itemId || !tx.paymentTransactionId) continue
        // `itemId` initialize sırasında ürün kimliği olarak gönderilmişti
        await prisma.orderItem.updateMany({
          where: { orderId: order.id, productId: tx.itemId },
          data: { paymentTransactionId: String(tx.paymentTransactionId) },
        })
      }
    } catch (txError) {
      console.error('[callback] kalem işlem kimlikleri kaydedilemedi:', order.id, txError)
    }

    // Başka bir callback bizden önce işlediyse tekrar stok düşme
    if (confirmed.count === 0) {
      return redirectGet(`${siteUrl}/odeme/basarili?siparis=${order.id}`)
    }

    // ── SONRA stokları düş ───────────────────────────────────────────────
    // Buradaki bir hata siparişi geçersiz kılmamalı: para alındı, sipariş
    // onaylandı. Stok tutmazsa yönetici uyarılır, müşteriye hata gösterilmez.
    try {
      await prisma.$transaction(
        async (tx: TransactionClient) => {
          const items = await tx.orderItem.findMany({
            where: { orderId: order!.id },
            select: { productId: true, quantity: true },
          })

          const oversold: string[] = []

          for (const item of items) {
            const reduced = await tx.product.updateMany({
              where: { id: item.productId, stockQuantity: { gte: item.quantity } },
              data: { stockQuantity: { decrement: item.quantity } },
            })

            // Yetmiyorsa negatife düşürme, sıfırla ve not al
            if (reduced.count === 0) {
              oversold.push(item.productId)
              await tx.product.updateMany({
                where: { id: item.productId },
                data: { stockQuantity: 0 },
              })
            }
          }

          await tx.order.update({
            where: { id: order!.id },
            data: {
              stockReduced: true,
              // Aşırı satış olduysa yönetici panelde görsün
              ...(oversold.length > 0
                ? {
                    adminNote: `STOK YETERSİZ — şu ürünlerde stok eksiye düşecekti, 0'a çekildi: ${oversold.join(', ')}. Sipariş karşılanabiliyor mu kontrol edin.`,
                  }
                : {}),
            },
          })

          if (oversold.length > 0) {
            console.error(
              `[callback] AŞIRI SATIŞ sipariş=${order!.id} ürünler=${oversold.join(',')}`,
            )
          }
        },
        // Çok kalemli siparişlerde varsayılan 5 sn yetmeyebiliyor
        { timeout: 20_000, maxWait: 10_000 },
      )
    } catch (stockError) {
      // Ödeme geçerli; yalnızca stok güncellemesi başarısız oldu
      console.error('[callback] STOK GÜNCELLENEMEDİ (ödeme alındı):', order.id, stockError)
      await prisma.order
        .update({
          where: { id: order.id },
          data: {
            adminNote:
              'Ödeme alındı ancak stok düşümü başarısız oldu. Stokları elle düzeltin.',
          },
        })
        .catch(() => {})
    }

    // Sipariş onay e-postası — başarısız olsa bile akışı durdurmaz
    await notifyOrderConfirmed(order.id)

    return redirectGet(`${siteUrl}/odeme/basarili?siparis=${order.id}`)
  } catch (err) {
    // Buraya yalnızca iyzico doğrulaması sırasındaki hatalar düşer.
    // Ödeme durumu belirsiz olduğu için siparişi iptal ETMİYORUZ — para
    // çekilmiş olabilir; yönetici incelemesi için işaretleyip müşteriye
    // "doğrulanıyor" mesajı gösteriyoruz.
    console.error('[callback] doğrulama hatası:', order.id, err)
    await prisma.order
      .update({
        where: { id: order.id },
        data: {
          adminNote:
            'Ödeme doğrulaması sırasında hata oluştu. iyzico panelinden bu siparişin ödemesini kontrol edin.',
        },
      })
      .catch(() => {})
    return redirectGet(`${siteUrl}/odeme/beklemede?siparis=${order.id}`)
  }
}
