import { NextRequest, NextResponse } from 'next/server'
import { retrieveCheckoutForm } from '@/lib/iyzico'
import { prisma } from '@/lib/db'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bayirlioglu-6rv9.vercel.app'

export async function POST(req: NextRequest) {
  let token: string | null = null

  try {
    const formData = await req.formData()
    token = formData.get('token') as string
  } catch {
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?hata=token`)
  }

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?hata=token`)
  }

  // Önce siparişi bul — conversationId (order.id) retrieve için gerekli
  const order = await prisma.order.findFirst({
    where: { paymentToken: token },
  })

  if (!order) {
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?hata=siparis`)
  }

  try {
    const result = await retrieveCheckoutForm(token, order.id)

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED', paymentStatus: 'paid' },
      })
      return NextResponse.redirect(`${siteUrl}/odeme/basarili?siparis=${order.id}`)
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', paymentStatus: 'failed' },
      })
      return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?hata=odeme`)
    }
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[callback] retrieveCheckoutForm hatası:', detail)
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?hata=sistem`)
  }
}
