import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { initializeCheckoutForm } from '@/lib/iyzico'

const KARGO_LIMIT = 500
const KARGO_UCRETI = 29.90

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })

  const body = await req.json()
  const { cartItems, addressData, brandKey } = body

  if (!cartItems?.length) {
    return NextResponse.json({ error: 'Sepet boş.' }, { status: 400 })
  }

  // Brand ID bul
  const brand = await prisma.brand.findUnique({ where: { key: brandKey } })
  if (!brand) return NextResponse.json({ error: 'Marka bulunamadı.' }, { status: 400 })

  // Kullanıcı profili
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  const nameParts = (dbUser?.name ?? 'Müşteri Ad').split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || 'Soyad'

  // Fiyat hesapla
  const subtotal = cartItems.reduce(
    (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
    0
  )
  const cargoFee = subtotal >= KARGO_LIMIT ? 0 : KARGO_UCRETI
  const total = parseFloat((subtotal + cargoFee).toFixed(2))

  // IP adresi
  const headersList = await headers()
  const ip = (headersList.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()

  // Adres verisi
  const addr = addressData
  const addrLine = `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.district}`

  // PENDING sipariş oluştur
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      brandId: brand.id,
      addressId: addr.savedAddressId ?? null,
      status: 'PENDING',
      paymentMethod: 'iyzico',
      paymentStatus: 'pending',
      totalAmount: total,
      items: {
        create: cartItems.map((item: { id: string; price: number; quantity: number }) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: parseFloat((item.price * item.quantity).toFixed(2)),
        })),
      },
    },
  })

  // İyzico sepet kalemleri — toplamlar price ile eşleşmeli
  const basketItems: { id: string; name: string; category1: string; itemType: string; price: string }[] = cartItems.map(
    (item: { id: string; name: string; price: number; quantity: number }) => ({
      id: item.id,
      name: item.name,
      category1: 'Ürün',
      itemType: 'PHYSICAL',
      price: parseFloat((item.price * item.quantity).toFixed(2)).toString(),
    })
  )

  if (cargoFee > 0) {
    basketItems.push({
      id: 'kargo',
      name: 'Kargo Ücreti',
      category1: 'Kargo',
      itemType: 'PHYSICAL',
      price: cargoFee.toFixed(2),
    })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bayirlioglu-6rv9.vercel.app'

  const request = {
    locale: 'tr',
    conversationId: order.id,
    price: total.toString(),
    paidPrice: total.toString(),
    currency: 'TRY',
    basketId: order.id,
    paymentGroup: 'PRODUCT',
    callbackUrl: `${siteUrl}/api/odeme/callback`,
    enabledInstallments: [1, 2, 3, 6, 9, 12],
    buyer: {
      id: user.id,
      name: firstName,
      surname: lastName,
      gsmNumber: dbUser?.phone ? `+9${dbUser.phone.replace(/^0/, '')}` : '+905000000000',
      email: user.email!,
      identityNumber: '11111111111',
      registrationAddress: addrLine,
      ip,
      city: addr.city ?? 'Istanbul',
      country: 'Turkey',
    },
    shippingAddress: {
      contactName: addr.fullName ?? dbUser?.name ?? 'Müşteri',
      city: addr.city ?? 'Istanbul',
      country: 'Turkey',
      address: addrLine,
    },
    billingAddress: {
      contactName: addr.fullName ?? dbUser?.name ?? 'Müşteri',
      city: addr.city ?? 'Istanbul',
      country: 'Turkey',
      address: addrLine,
    },
    basketItems,
  }

  try {
    const result = await initializeCheckoutForm(request)

    if (result.status !== 'success') {
      await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
      return NextResponse.json(
        { error: result.errorMessage ?? 'Ödeme başlatılamadı.' },
        { status: 400 }
      )
    }

    // Token'ı siparişe kaydet
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentToken: result.token },
    })

    return NextResponse.json({
      checkoutFormContent: result.checkoutFormContent,
      token: result.token,
      orderId: order.id,
    })
  } catch {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
    return NextResponse.json({ error: 'Ödeme sistemi geçici olarak kullanılamıyor.' }, { status: 500 })
  }
}
