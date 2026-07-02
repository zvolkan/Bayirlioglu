/* eslint-disable @typescript-eslint/no-require-imports */
const Iyzipay = require('iyzipay')

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_BASE_URL ?? 'https://sandbox-api.iyzipay.com',
})

export function initializeCheckoutForm(request: Record<string, unknown>): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(request, (err: unknown, result: unknown) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

export function retrieveCheckoutForm(token: string, conversationId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzipay.checkoutFormResult.retrieve(
      { locale: 'tr', conversationId, token },
      (err: unknown, result: unknown) => {
        if (err) reject(err)
        else resolve(result)
      }
    )
  })
}
