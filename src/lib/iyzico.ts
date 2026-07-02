/* eslint-disable @typescript-eslint/no-require-imports */
const Iyzipay = require('iyzipay')

function getClient() {
  const apiKey = process.env.IYZICO_API_KEY
  const secretKey = process.env.IYZICO_SECRET_KEY
  if (!apiKey || !secretKey) {
    throw new Error('IYZICO_API_KEY veya IYZICO_SECRET_KEY eksik.')
  }
  return new Iyzipay({
    apiKey,
    secretKey,
    uri: process.env.IYZICO_BASE_URL ?? 'https://sandbox-api.iyzipay.com',
  })
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
