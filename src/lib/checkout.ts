/**
 * Sipariş tutarı hesabı — TEK KAYNAK.
 *
 * Kargo limiti/ücreti eskiden dört ayrı dosyada kopyalanmıştı; biri
 * değiştiğinde diğerleri unutuluyordu. Sepet, ödeme ve sipariş detayı artık
 * hepsi buradan okur.
 */

export const KARGO_LIMIT = 500
export const KARGO_UCRETI = 29.9

/** Fiyatları 2 haneye yuvarla — kayan nokta artıklarını temizler */
export function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateShipping(subtotal: number): number {
  return subtotal >= KARGO_LIMIT ? 0 : KARGO_UCRETI
}

/**
 * KDV DAHİL bir tutardan KDV'yi ayrıştırır.
 * Fiyatlar KDV dahil girildiği için matrah = tutar / (1 + oran/100).
 *
 * Örn. 120 TL, %20 → matrah 100, KDV 20.
 */
export function extractVat(grossAmount: number, vatRatePercent: number) {
  const rate = Number.isFinite(vatRatePercent) ? Math.max(0, vatRatePercent) : 0
  const net = money(grossAmount / (1 + rate / 100))
  return { net, vat: money(grossAmount - net), rate }
}

/** Türkiye'de geçerli KDV oranları */
export const VAT_RATES = [1, 10, 20] as const

export interface OrderTotals {
  subtotal: number
  shippingFee: number
  total: number
}

/**
 * Sipariş toplamı.
 *
 * NOT: Gösterilen fiyatlar KDV DAHİLDİR. Eskiden sepet sayfası ayrı bir KDV
 * satırı gösterip toplama eklemiyordu; bu da sipariş detayındaki "KDV dahil"
 * ifadesiyle çelişiyordu. Artık tek bir yaklaşım var: fiyatlar KDV dahil.
 */
export function calculateTotals(subtotal: number): OrderTotals {
  const sub = money(subtotal)
  const shippingFee = calculateShipping(sub)
  return {
    subtotal: sub,
    shippingFee,
    total: money(sub + shippingFee),
  }
}
