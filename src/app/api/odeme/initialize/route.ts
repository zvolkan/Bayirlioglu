import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { initializeCheckoutForm } from '@/lib/iyzico'
import { calculateTotals, money } from '@/lib/checkout'
import { getSiteUrl } from '@/lib/site-url'

interface IncomingItem {
  id?: unknown
  quantity?: unknown
}

/** Türk cep numarasını iyzico'nun beklediği +90XXXXXXXXXX biçimine çevirir */
function normalizeGsm(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  // 0555..., 555..., 90555..., 0090555...
  const local = digits.replace(/^0+/, '').replace(/^90/, '')
  if (local.length !== 10) return null
  return `+90${local}`
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })

  let body: { cartItems?: IncomingItem[]; addressData?: Record<string, string>; brandKey?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const { cartItems, addressData, brandKey } = body

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return NextResponse.json({ error: 'Sepet boş.' }, { status: 400 })
  }
  if (cartItems.length > 100) {
    return NextResponse.json({ error: 'Sepette çok fazla ürün var.' }, { status: 400 })
  }
  if (!addressData) {
    return NextResponse.json({ error: 'Teslimat adresi gerekli.' }, { status: 400 })
  }

  // ── Marka ────────────────────────────────────────────────────────────────
  const brand = await prisma.brand.findUnique({ where: { key: String(brandKey ?? '') } })
  if (!brand) return NextResponse.json({ error: 'Marka bulunamadı.' }, { status: 400 })

  // ── Sepeti sunucuda doğrula ──────────────────────────────────────────────
  // Fiyatlar İSTEMCİDEN ALINMAZ. Tutar yalnızca veritabanındaki fiyattan
  // hesaplanır; aksi hâlde istek değiştirilerek ürün 1 TL'ye alınabilirdi.
  const requested = new Map<string, number>()
  for (const item of cartItems) {
    const id = typeof item?.id === 'string' ? item.id : null
    const qty = Number(item?.quantity)
    if (!id || !Number.isInteger(qty) || qty < 1 || qty > 999) {
      return NextResponse.json({ error: 'Sepette geçersiz ürün bilgisi var.' }, { status: 400 })
    }
    requested.set(id, (requested.get(id) ?? 0) + qty)
  }

  const products = await prisma.product.findMany({
    where: { id: { in: [...requested.keys()] } },
    select: {
      id: true,
      name: true,
      price: true,
      salePrice: true,
      stockQuantity: true,
      isActive: true,
      brandId: true,
    },
  })

  if (products.length !== requested.size) {
    return NextResponse.json(
      { error: 'Sepetteki bazı ürünler artık mevcut değil. Sepetinizi yenileyin.' },
      { status: 409 },
    )
  }

  const validated: { id: string; name: string; unitPrice: number; quantity: number }[] = []

  for (const product of products) {
    const quantity = requested.get(product.id)!

    if (!product.isActive) {
      return NextResponse.json(
        { error: `"${product.name}" artık satışta değil. Sepetinizden çıkarın.` },
        { status: 409 },
      )
    }
    if (product.brandId !== brand.id) {
      return NextResponse.json(
        { error: 'Sepetinizde farklı markaya ait ürünler var. Lütfen ayrı ayrı sipariş verin.' },
        { status: 409 },
      )
    }
    if (product.stockQuantity < quantity) {
      return NextResponse.json(
        {
          error:
            product.stockQuantity === 0
              ? `"${product.name}" tükendi.`
              : `"${product.name}" için yeterli stok yok (kalan: ${product.stockQuantity}).`,
        },
        { status: 409 },
      )
    }

    const unitPrice = Number(product.salePrice ?? product.price)
    validated.push({ id: product.id, name: product.name, unitPrice, quantity })
  }

  const subtotalRaw = validated.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const { subtotal, shippingFee, total } = calculateTotals(subtotalRaw)

  if (total <= 0) {
    return NextResponse.json({ error: 'Sipariş tutarı geçersiz.' }, { status: 400 })
  }

  // ── Adres: kayıtlıysa kullanıcıya ait mi doğrula ─────────────────────────
  let addr = addressData
  const savedAddressId = addressData.savedAddressId

  if (savedAddressId) {
    const saved = await prisma.address.findFirst({
      where: { id: String(savedAddressId), userId: user.id },
    })
    if (!saved) {
      return NextResponse.json({ error: 'Seçilen adres bulunamadı.' }, { status: 400 })
    }
    // Kayıtlı adresin DB'deki hâli esas alınır — istemcinin gönderdiği değil
    addr = {
      savedAddressId: saved.id,
      fullName: saved.fullName,
      phone: saved.phone,
      line1: saved.line1,
      line2: saved.line2 ?? '',
      district: saved.district,
      city: saved.city,
      postalCode: saved.postalCode ?? '',
    }
  }

  for (const field of ['fullName', 'phone', 'line1', 'district', 'city'] as const) {
    if (!addr[field] || String(addr[field]).trim().length < 2) {
      return NextResponse.json({ error: 'Teslimat adresi eksik.' }, { status: 400 })
    }
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  const contactName = String(addr.fullName).trim()
  const nameParts = contactName.split(/\s+/)
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || firstName

  const gsm = normalizeGsm(addr.phone) ?? normalizeGsm(dbUser?.phone)
  if (!gsm) {
    return NextResponse.json(
      { error: 'Geçerli bir cep telefonu numarası girin (örn. 0555 111 22 33).' },
      { status: 400 },
    )
  }

  const headersList = await headers()
  const ip = (headersList.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()
  const addrLine = `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.district}`

  // ── PENDING sipariş — tutar dökümü ve adres kopyasıyla ───────────────────
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      brandId: brand.id,
      addressId: savedAddressId ? String(savedAddressId) : null,
      status: 'PENDING',
      paymentMethod: 'iyzico',
      paymentStatus: 'pending',
      subtotal,
      shippingFee,
      totalAmount: total,
      shipFullName: contactName,
      shipPhone: String(addr.phone ?? ''),
      shipLine1: String(addr.line1),
      shipLine2: addr.line2 ? String(addr.line2) : null,
      shipDistrict: String(addr.district),
      shipCity: String(addr.city),
      shipPostalCode: addr.postalCode ? String(addr.postalCode) : null,
      items: {
        create: validated.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: money(item.unitPrice * item.quantity),
        })),
      },
    },
  })

  const basketItems = validated.map((item) => ({
    id: item.id,
    name: item.name.slice(0, 100),
    category1: 'Ürün',
    itemType: 'PHYSICAL',
    price: money(item.unitPrice * item.quantity).toFixed(2),
  }))

  if (shippingFee > 0) {
    basketItems.push({
      id: 'kargo',
      name: 'Kargo Ücreti',
      category1: 'Kargo',
      itemType: 'PHYSICAL',
      price: shippingFee.toFixed(2),
    })
  }

  const siteUrl = getSiteUrl()

  const request = {
    locale: 'tr',
    conversationId: order.id,
    price: subtotal.toFixed(2),
    paidPrice: total.toFixed(2),
    currency: 'TRY',
    basketId: order.id,
    paymentGroup: 'PRODUCT',
    callbackUrl: `${siteUrl}/api/odeme/callback`,
    enabledInstallments: [1, 2, 3, 6, 9, 12],
    buyer: {
      id: user.id,
      name: firstName,
      surname: lastName,
      gsmNumber: gsm,
      email: user.email!,
      registrationAddress: addrLine,
      ip,
      city: String(addr.city),
      country: 'Turkey',
    },
    shippingAddress: {
      contactName,
      city: String(addr.city),
      country: 'Turkey',
      address: addrLine,
    },
    billingAddress: {
      contactName,
      city: String(addr.city),
      country: 'Turkey',
      address: addrLine,
    },
    basketItems,
  }

  try {
    const result = await initializeCheckoutForm(request)

    if (result.status !== 'success') {
      console.error('[odeme] iyzico başlatma hatası:', result.errorCode, result.errorMessage)
      await prisma.order.delete({ where: { id: order.id } }).catch((e) => {
        console.error('[odeme] öksüz sipariş silinemedi:', order.id, e)
      })
      return NextResponse.json(
        { error: result.errorMessage ?? 'Ödeme başlatılamadı.' },
        { status: 400 },
      )
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentToken: result.token, formContent: result.checkoutFormContent },
    })

    return NextResponse.json({ token: result.token, orderId: order.id })
  } catch (err) {
    console.error('[odeme] iyzico bağlantı hatası:', err)
    await prisma.order.delete({ where: { id: order.id } }).catch((e) => {
      console.error('[odeme] öksüz sipariş silinemedi:', order.id, e)
    })
    return NextResponse.json(
      { error: 'Ödeme sistemi geçici olarak kullanılamıyor.' },
      { status: 500 },
    )
  }
}
