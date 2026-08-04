
import { prisma } from '@/lib/db'
import { sendEmailSafe } from './send'
import {
  orderConfirmationEmail,
  orderShippedEmail,
  orderRefundedEmail,
  adminNewOrderEmail,
  type OrderEmailData,
} from './templates'

/**
 * Sipariş bildirimleri.
 *
 * Hepsi "ateşle ve unut" mantığında: e-posta gönderilemezse hata fırlatmaz,
 * yalnızca log'a yazar. Sipariş akışı hiçbir koşulda e-posta yüzünden bozulmaz.
 */

/** Bilinen kargo firmaları için takip bağlantısı */
function carrierTrackingUrl(carrier: string, code: string): string | null {
  const c = carrier.toLocaleLowerCase('tr')
  if (c.includes('yurtiçi') || c.includes('yurtici'))
    return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${code}`
  if (c.includes('aras')) return `https://kargotakip.araskargo.com.tr/mobil/sorgu.aspx?code=${code}`
  if (c.includes('mng')) return `https://kargotakip.mngkargo.com.tr/?takipNo=${code}`
  if (c.includes('ptt')) return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${code}`
  if (c.includes('sürat') || c.includes('surat'))
    return `https://www.suratkargo.com.tr/KargoTakip/?kargotakipno=${code}`
  if (c.includes('ups')) return `https://www.ups.com/track?tracknum=${code}`
  return null
}

async function loadOrderForEmail(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      subtotal: true,
      shippingFee: true,
      totalAmount: true,
      shipFullName: true,
      shipPhone: true,
      shipLine1: true,
      shipLine2: true,
      shipDistrict: true,
      shipCity: true,
      carrier: true,
      trackingNumber: true,
      user: { select: { email: true, name: true } },
      items: {
        select: {
          quantity: true,
          totalPrice: true,
          product: { select: { name: true, unit: true } },
        },
      },
    },
  })
}

type LoadedOrder = NonNullable<Awaited<ReturnType<typeof loadOrderForEmail>>>

function toEmailData(order: LoadedOrder): OrderEmailData {
  return {
    orderId: order.id,
    customerName: order.shipFullName ?? order.user.name ?? 'Müşterimiz',
    items: order.items.map(
      (item: {
        quantity: number
        totalPrice: unknown
        product: { name: string; unit: string }
      }) => ({
        name: item.product.name,
        quantity: item.quantity,
        unit: item.product.unit,
        totalPrice: Number(item.totalPrice),
      }),
    ),
    subtotal: Number(order.subtotal ?? order.totalAmount),
    shippingFee: Number(order.shippingFee ?? 0),
    total: Number(order.totalAmount),
    shipFullName: order.shipFullName ?? order.user.name ?? '',
    shipPhone: order.shipPhone ?? '',
    shipLine1: order.shipLine1 ?? '',
    shipLine2: order.shipLine2,
    shipDistrict: order.shipDistrict ?? '',
    shipCity: order.shipCity ?? '',
  }
}

// ─── Sipariş onayı ───────────────────────────────────────────────────────────

export async function notifyOrderConfirmed(orderId: string): Promise<void> {
  try {
    const order = await loadOrderForEmail(orderId)
    if (!order?.user.email) return

    const data = toEmailData(order)

    const customer = orderConfirmationEmail(data)
    await sendEmailSafe({
      to: order.user.email,
      subject: customer.subject,
      html: customer.html,
      text: customer.text,
    })

    // Yöneticiye bildirim — ayrı adres tanımlıysa
    const adminTo = process.env.ADMIN_NOTIFY_EMAIL?.trim()
    if (adminTo) {
      const adminMail = adminNewOrderEmail(data)
      await sendEmailSafe({
        to: adminTo,
        subject: adminMail.subject,
        html: adminMail.html,
        text: adminMail.text,
        replyTo: order.user.email,
      })
    }
  } catch (error) {
    console.error('[e-posta] sipariş onayı gönderilemedi:', orderId, error)
  }
}

// ─── Kargo bildirimi ─────────────────────────────────────────────────────────

export async function notifyOrderShipped(orderId: string): Promise<void> {
  try {
    const order = await loadOrderForEmail(orderId)
    if (!order?.user.email || !order.carrier || !order.trackingNumber) return

    const mail = orderShippedEmail({
      orderId: order.id,
      customerName: order.shipFullName ?? order.user.name ?? 'Müşterimiz',
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      trackingUrl: carrierTrackingUrl(order.carrier, order.trackingNumber),
    })

    await sendEmailSafe({
      to: order.user.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    })
  } catch (error) {
    console.error('[e-posta] kargo bildirimi gönderilemedi:', orderId, error)
  }
}

// ─── İade / iptal bildirimi ──────────────────────────────────────────────────

export async function notifyOrderRefunded(orderId: string, reason?: string): Promise<void> {
  try {
    const order = await loadOrderForEmail(orderId)
    if (!order?.user.email) return

    const mail = orderRefundedEmail({
      orderId: order.id,
      customerName: order.shipFullName ?? order.user.name ?? 'Müşterimiz',
      amount: Number(order.totalAmount),
      reason,
    })

    await sendEmailSafe({
      to: order.user.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    })
  } catch (error) {
    console.error('[e-posta] iade bildirimi gönderilemedi:', orderId, error)
  }
}
