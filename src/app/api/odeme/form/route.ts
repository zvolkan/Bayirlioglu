import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return new NextResponse('Token eksik.', { status: 400 })
  }

  const order = await prisma.order.findFirst({
    where: { paymentToken: token, status: 'PENDING' },
    select: { formContent: true },
  })

  if (!order?.formContent) {
    return new NextResponse('Ödeme formu bulunamadı veya süresi doldu.', { status: 404 })
  }

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Güvenli Ödeme — Bayırlıoğlu Grup</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; min-height: 100vh; }
  </style>
</head>
<body>
  ${order.formContent}
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
