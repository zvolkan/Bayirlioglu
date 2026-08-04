import { NextRequest, NextResponse } from 'next/server'
import { retrieveCheckoutForm } from '@/lib/iyzico'
import { prisma, type TransactionClient } from '@/lib/db'
import { getSiteUrl } from '@/lib/site-url'

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
    const result = await retrieveCheckoutForm(token, order.id)

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

    // ── Siparişi onayla + stok düş (tek transaction, bir kez) ──────────────
    await prisma.$transaction(async (tx: TransactionClient) => {
      // Yalnızca hâlâ ödenmemiş durumdayken güncelle (yarış koşulu koruması)
      const updated = await tx.order.updateMany({
        where: { id: order!.id, paymentStatus: { not: 'paid' } },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'paid',
          paymentId: result?.paymentId ? String(result.paymentId) : null,
        },
      })

      // Başka bir istek bizden önce işlediyse stok düşümünü tekrarlama
      if (updated.count === 0) return

      const items = await tx.orderItem.findMany({
        where: { orderId: order!.id },
        select: { productId: true, quantity: true },
      })

      for (const item of items) {
        // Yeterli stok varsa düş
        const reduced = await tx.product.updateMany({
          where: { id: item.productId, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        })

        // Yetmiyorsa (araya giren sipariş) negatife düşürme, sıfırla ve bildir
        if (reduced.count === 0) {
          console.error(
            `[callback] STOK YETERSİZ sipariş=${order!.id} ürün=${item.productId} adet=${item.quantity}`,
          )
          await tx.product.updateMany({
            where: { id: item.productId },
            data: { stockQuantity: 0 },
          })
        }
      }

      await tx.order.update({
        where: { id: order!.id },
        data: { stockReduced: true },
      })
    })

    return redirectGet(`${siteUrl}/odeme/basarili?siparis=${order.id}`)
  } catch (err) {
    // Hata detayını kullanıcıya gösterme — yalnızca sunucu loguna yaz
    console.error('[callback] beklenmeyen hata:', order.id, err)
    return redirectGet(`${siteUrl}/odeme/basarisiz?hata=sistem`)
  }
}
