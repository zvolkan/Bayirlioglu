
import { prisma } from '@/lib/db'
import { sendEmailSafe, unquote } from './send'
import { deploymentTag } from '@/lib/deployment'
import { carrierTrackingUrl } from '@/lib/carrier'
import {
  orderConfirmationEmail,
  orderShippedEmail,
  orderRefundedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
  adminNewOrderEmail,
  type OrderEmailData,
} from './templates'

/**
 * Sipariş bildirimleri.
 *
 * Hepsi "ateşle ve unut" mantığında: e-posta gönderilemezse hata fırlatmaz,
 * yalnızca log'a yazar. Sipariş akışı hiçbir koşulda e-posta yüzünden bozulmaz.
 */

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
  let failure: string | null = null

  // Bu satır günlüklerde hiç görünmüyorsa e-posta kodu deploy edilmemiş
  // veya callback buraya kadar gelmemiş demektir.
  console.log('[e-posta] sipariş onayı tetiklendi:', orderId)

  try {
    const order = await loadOrderForEmail(orderId)
    if (!order) {
      failure = 'E-posta gönderilemedi: sipariş kaydı okunamadı.'
      return
    }
    if (!order.user.email) {
      failure = 'E-posta gönderilemedi: siparişin kullanıcısında e-posta adresi yok.'
      return
    }

    const data = toEmailData(order)

    const customer = orderConfirmationEmail(data)
    const customerResult = await sendEmailSafe({
      to: order.user.email,
      subject: customer.subject,
      html: customer.html,
      text: customer.text,
    })

    if (!customerResult.ok) {
      failure =
        customerResult.reason === 'not-configured'
          ? 'Müşteri onay e-postası GÖNDERİLMEDİ: RESEND_API_KEY veya EMAIL_FROM sunucuda tanımlı değil (Vercel değişkenlerini kontrol edip yeniden deploy alın).'
          : `Müşteri onay e-postası GÖNDERİLEMEDİ. Sağlayıcı yanıtı: ${
              customerResult.detail ?? 'bilinmiyor'
            }`
    }

    // Yöneticiye bildirim — ayrı adres tanımlıysa
    const adminTo = process.env.ADMIN_NOTIFY_EMAIL
      ? unquote(process.env.ADMIN_NOTIFY_EMAIL)
      : ''
    if (adminTo) {
      const adminMail = adminNewOrderEmail(data)
      const adminResult = await sendEmailSafe({
        to: adminTo,
        subject: adminMail.subject,
        html: adminMail.html,
        text: adminMail.text,
        replyTo: order.user.email,
      })

      if (!adminResult.ok && !failure) {
        failure = `Yönetici bildirimi gönderilemedi (${adminTo}). Sağlayıcı yanıtı: ${
          adminResult.detail ?? adminResult.reason
        }`
      }
    }
  } catch (error) {
    failure = `Onay e-postası hazırlanırken hata: ${String(error).slice(0, 200)}`
    console.error('[e-posta] sipariş onayı gönderilemedi:', orderId, error)
  } finally {
    // Sunucu günlüklerine erişmeden de görülebilsin diye başarısızlık sebebi
    // siparişin yönetici notuna yazılır. Müşteri teyit e-postası almadıysa
    // yöneticinin bunu bilmesi gerekiyor — sessizce kaybolmamalı.
    if (failure) await appendAdminNote(orderId, `${failure} [build: ${deploymentTag()}]`)
  }
}

/** Var olan yönetici notunu ezmeden sonuna ekler */
async function appendAdminNote(orderId: string, note: string): Promise<void> {
  try {
    const current = await prisma.order.findUnique({
      where: { id: orderId },
      select: { adminNote: true },
    })
    const merged = [current?.adminNote, note].filter(Boolean).join('\n')
    await prisma.order.update({
      where: { id: orderId },
      data: { adminNote: merged.slice(-1000) },
    })
  } catch (error) {
    console.error('[e-posta] yönetici notu yazılamadı:', orderId, error)
  }
}

// ─── Kargo bildirimi ─────────────────────────────────────────────────────────

export async function notifyOrderShipped(orderId: string): Promise<void> {
  let failure: string | null = null

  try {
    const order = await loadOrderForEmail(orderId)
    if (!order?.user.email) return

    // Kargo bilgisi girilmeden durum SHIPPED yapıldıysa gönderecek bir şey yok.
    // Sessizce geçmek yerine not düşülüyor: müşteri takip numarası bekliyor.
    if (!order.carrier || !order.trackingNumber) {
      failure =
        'Kargo bildirimi gönderilmedi: kargo firması veya takip numarası girilmemiş. ' +
        'Kargo bilgisini kaydettiğinizde e-posta otomatik gider.'
      return
    }

    const mail = orderShippedEmail({
      orderId: order.id,
      customerName: order.shipFullName ?? order.user.name ?? 'Müşterimiz',
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      trackingUrl: carrierTrackingUrl(order.carrier, order.trackingNumber),
    })

    const result = await sendEmailSafe({
      to: order.user.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    })

    if (!result.ok) {
      failure = `Kargo bildirimi GÖNDERİLEMEDİ. Sağlayıcı yanıtı: ${result.detail ?? result.reason}`
    }
  } catch (error) {
    failure = `Kargo bildirimi hazırlanırken hata: ${String(error).slice(0, 200)}`
    console.error('[e-posta] kargo bildirimi gönderilemedi:', orderId, error)
  } finally {
    if (failure) await appendAdminNote(orderId, `${failure} [build: ${deploymentTag()}]`)
  }
}

// ─── Teslim edildi ───────────────────────────────────────────────────────────

export async function notifyOrderDelivered(orderId: string): Promise<void> {
  let failure: string | null = null

  try {
    const order = await loadOrderForEmail(orderId)
    if (!order?.user.email) return

    const mail = orderDeliveredEmail({
      orderId: order.id,
      customerName: order.shipFullName ?? order.user.name ?? 'Müşterimiz',
    })

    const result = await sendEmailSafe({
      to: order.user.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    })

    if (!result.ok) {
      failure = `Teslimat bildirimi GÖNDERİLEMEDİ. Sağlayıcı yanıtı: ${result.detail ?? result.reason}`
    }
  } catch (error) {
    failure = `Teslimat bildirimi hazırlanırken hata: ${String(error).slice(0, 200)}`
    console.error('[e-posta] teslimat bildirimi gönderilemedi:', orderId, error)
  } finally {
    if (failure) await appendAdminNote(orderId, `${failure} [build: ${deploymentTag()}]`)
  }
}

// ─── Ödemesiz iptal ──────────────────────────────────────────────────────────

/** Ödemesi alınmamış siparişin iptali. Para iadesi olan iptal için notifyOrderRefunded. */
export async function notifyOrderCancelled(orderId: string, reason?: string): Promise<void> {
  let failure: string | null = null

  try {
    const order = await loadOrderForEmail(orderId)
    if (!order?.user.email) return

    const mail = orderCancelledEmail({
      orderId: order.id,
      customerName: order.shipFullName ?? order.user.name ?? 'Müşterimiz',
      reason,
    })

    const result = await sendEmailSafe({
      to: order.user.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    })

    if (!result.ok) {
      failure = `İptal bildirimi GÖNDERİLEMEDİ. Sağlayıcı yanıtı: ${result.detail ?? result.reason}`
    }
  } catch (error) {
    failure = `İptal bildirimi hazırlanırken hata: ${String(error).slice(0, 200)}`
    console.error('[e-posta] iptal bildirimi gönderilemedi:', orderId, error)
  } finally {
    if (failure) await appendAdminNote(orderId, `${failure} [build: ${deploymentTag()}]`)
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
