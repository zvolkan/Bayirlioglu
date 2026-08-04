/* eslint-disable @typescript-eslint/no-require-imports */
const Iyzipay = require('iyzipay')

const SANDBOX_URI = 'https://sandbox-api.iyzipay.com'
const PRODUCTION_URI = 'https://api.iyzipay.com'

let sandboxWarned = false

/**
 * iyzico API adresi.
 *
 * Eskiden varsayılan sandbox'tı: IYZICO_BASE_URL üretimde tanımlanmazsa
 * ödemeler sessizce test ortamına gidiyor ve para tahsil edilmiyordu.
 * Artık üretimde varsayılan canlı adres; sandbox'ta kalmak isteniyorsa
 * açıkça IYZICO_BASE_URL verilmeli.
 */
function resolveUri(): string {
  const explicit = process.env.IYZICO_BASE_URL?.trim()
  if (explicit) {
    if (process.env.NODE_ENV === 'production' && explicit.includes('sandbox') && !sandboxWarned) {
      sandboxWarned = true
      console.warn(
        '[iyzico] UYARI: Üretim ortamında sandbox adresi kullanılıyor — ' +
          'gerçek ödeme alınmayacak.',
      )
    }
    return explicit
  }
  return process.env.NODE_ENV === 'production' ? PRODUCTION_URI : SANDBOX_URI
}

function getClient() {
  const apiKey = process.env.IYZICO_API_KEY
  const secretKey = process.env.IYZICO_SECRET_KEY
  if (!apiKey || !secretKey) {
    throw new Error('IYZICO_API_KEY veya IYZICO_SECRET_KEY eksik.')
  }
  return new Iyzipay({ apiKey, secretKey, uri: resolveUri() })
}

export function initializeCheckoutForm(request: Record<string, unknown>): Promise<any> {
  return new Promise((resolve, reject) => {
    getClient().checkoutFormInitialize.create(request, (err: unknown, result: unknown) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

export function retrieveCheckoutForm(token: string, conversationId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    getClient().checkoutForm.retrieve(
      { locale: 'tr', conversationId, token },
      (err: unknown, result: unknown) => {
        if (err) reject(err)
        else resolve(result)
      }
    )
  })
}

/**
 * Ödeme iadesi — v2 API (tüm ödemeyi tek seferde iade eder).
 *
 * DİKKAT: v1 `/payment/refund` uç noktası `paymentTransactionId` bekler; bu,
 * sepet KALEMİ bazındaki işlem kimliğidir ve `paymentId` ile AYNI DEĞİLDİR.
 * Yanlışlıkla `paymentId` gönderilirse iyzico "işlem bulunamadı" döner ve para
 * asla iade edilmez. v2 uç noktası (`/v2/payment/refund`) doğrudan `paymentId`
 * ile çalıştığı ve tüm ödemeyi kapsadığı için onu kullanıyoruz.
 */
export function refundPayment(params: {
  paymentId: string
  price: string
  conversationId: string
  ip?: string
}): Promise<any> {
  return new Promise((resolve, reject) => {
    getClient().refundV2.create(
      {
        locale: 'tr',
        conversationId: params.conversationId,
        paymentId: params.paymentId,
        price: params.price,
        currency: 'TRY',
        ip: params.ip ?? '127.0.0.1',
      },
      (err: unknown, result: unknown) => {
        if (err) reject(err)
        else resolve(result)
      },
    )
  })
}

/** Ödemenin tamamını iptal eder (aynı gün içinde, henüz kapanmamış işlemler için) */
export function cancelPayment(params: {
  paymentId: string
  conversationId: string
  ip?: string
}): Promise<any> {
  return new Promise((resolve, reject) => {
    getClient().cancel.create(
      {
        locale: 'tr',
        conversationId: params.conversationId,
        paymentId: params.paymentId,
        ip: params.ip ?? '127.0.0.1',
      },
      (err: unknown, result: unknown) => {
        if (err) reject(err)
        else resolve(result)
      },
    )
  })
}
