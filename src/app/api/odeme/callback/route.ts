import { NextRequest, NextResponse } from 'next/server'
import { retrieveCheckoutForm } from '@/lib/iyzico'
import { prisma } from '@/lib/db'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bayirlioglu-6rv9.vercel.app'

export async function POST(req: NextRequest) {
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
    console.error('[callback] token parse hatası:', e)
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?hata=token`)
  }

  console.log('[callback] token:', token ? token.slice(0, 20) + '...' : 'YOK')

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?hata=token`)
  }

  // ── Siparişi bul ──────────────────────────────────────────────────────────
  let order: { id: string } | null = null
  try {
    order = await prisma.order.findFirst({
      where: { paymentToken: token },
      select: { id: true },
    })
  } catch (e) {
    console.error('[callback] sipariş DB hatası:', e)
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?hata=sistem`)
  }

  console.log('[callback] sipariş:', order ? order.id : 'BULUNAMADI')

  if (!order) {
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?hata=siparis`)
  }

  // ── İyzico doğrulama ──────────────────────────────────────────────────────
  try {
    const result = await retrieveCheckoutForm(token, order.id)

    console.log('[callback] iyzico sonuç:', JSON.stringify({
      status: result?.status,
      paymentStatus: result?.paymentStatus,
      errorCode: result?.errorCode,
      errorMessage: result?.errorMessage,
    }))

    if (result?.status === 'success' && result?.paymentStatus === 'SUCCESS') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED', paymentStatus: 'paid' },
      })
      return NextResponse.redirect(`${siteUrl}/odeme/basarili?siparis=${order.id}`)
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', paymentStatus: 'failed' },
      }).catch(() => {})
      const errorMsg = result?.errorMessage ?? 'Ödeme reddedildi'
      console.log('[callback] ödeme başarısız:', errorMsg)
      return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?hata=odeme`)
    }
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[callback] HATA:', detail)
    return NextResponse.redirect(
      `${siteUrl}/odeme/basarisiz?hata=sistem&d=${encodeURIComponent(detail.slice(0, 100))}`
    )
  }
}
