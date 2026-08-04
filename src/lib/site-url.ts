/**
 * Sitenin genel adresi.
 *
 * Eskiden birden çok dosyada `?? 'https://bayirlioglu-6rv9.vercel.app'` şeklinde
 * bir Vercel önizleme adresi yedek olarak duruyordu; bu adres ödeme geri dönüş
 * URL'sine ve mesafeli satış sözleşmesi metnine de sızıyordu.
 *
 * Artık tek kaynak burası. Üretimde NEXT_PUBLIC_SITE_URL tanımlı değilse
 * uyarı verilir — sessizce yanlış alan adına düşmez.
 */

const FALLBACK_DEV = 'http://localhost:3000'

let warned = false

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (fromEnv) return fromEnv.replace(/\/+$/, '')

  if (process.env.NODE_ENV === 'production' && !warned) {
    warned = true
    console.error(
      '[config] NEXT_PUBLIC_SITE_URL tanımlı değil. Ödeme geri dönüşleri ve ' +
        'sözleşme metinleri yanlış adrese işaret edecek. Vercel ortam ' +
        'değişkenlerine gerçek alan adını ekleyin.',
    )
  }

  // Vercel otomatik değişkeni son çare olarak kullanılır
  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) return `https://${vercelUrl.replace(/\/+$/, '')}`

  return FALLBACK_DEV
}

/** Sözleşme metinlerinde gösterilecek alan adı (protokolsüz) */
export function getSiteDomain(): string {
  return getSiteUrl().replace(/^https?:\/\//, '')
}
