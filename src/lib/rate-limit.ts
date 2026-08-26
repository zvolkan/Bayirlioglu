/**
 * Basit hız sınırlayıcı ve güvenilir istemci IP'si.
 *
 * SINIRLARI AÇIKÇA: sayaçlar süreç belleğinde tutuluyor. Vercel'de her
 * sunucusuz örnek kendi sayacını tuttuğu için gerçek sınır
 * `max × çalışan örnek sayısı` kadardır. Kalıcı çözüm Upstash Redis / Vercel KV
 * ya da veritabanında bir `login_attempt` tablosudur; ikisi de altyapı kararı
 * gerektirdiği için burada yapılmadı.
 *
 * Buna rağmen iki gerçek iyileştirme var:
 *
 * 1. IP artık `x-forwarded-for`'un İLK öğesinden okunmuyor. O öğe proxy'nin
 *    eklediği değil, İSTEMCİNİN gönderdiği değerdir; saldırgan her istekte
 *    farklı bir değer yollayıp her denemede yeni bir sayaç açabiliyordu, yani
 *    5 denemelik sınır hiç devreye girmiyordu.
 * 2. IP'den BAĞIMSIZ ikinci bir küresel sayaç eklendi. IP taklit edilse bile
 *    bu sayaç dolduğunda giriş kapanır — spoofing'i etkisiz kılan asıl budur.
 */

type Kayit = { count: number; firstAt: number }

const kovalar = new Map<string, Map<string, Kayit>>()

function kova(ad: string): Map<string, Kayit> {
  let m = kovalar.get(ad)
  if (!m) {
    m = new Map()
    kovalar.set(ad, m)
  }
  // Bellek sızıntısına karşı kaba temizlik
  if (m.size > 5000) m.clear()
  return m
}

export type HizSonucu = { ok: boolean; kalanMs: number }

/** `key` için `windowMs` içinde en fazla `max` istek. */
export function rateLimit(
  bucket: string,
  key: string,
  max: number,
  windowMs: number,
): HizSonucu {
  const now = Date.now()
  const m = kova(bucket)
  const record = m.get(key)

  if (!record || now - record.firstAt > windowMs) {
    m.set(key, { count: 1, firstAt: now })
    return { ok: true, kalanMs: 0 }
  }

  record.count += 1
  if (record.count <= max) return { ok: true, kalanMs: 0 }

  return { ok: false, kalanMs: windowMs - (now - record.firstAt) }
}

/** Başarılı işlemden sonra sayacı sıfırlar. */
export function rateLimitReset(bucket: string, key: string): void {
  kova(bucket).delete(key)
}

/**
 * İstemci IP'si.
 *
 * Sıra önemli: `x-vercel-forwarded-for` yalnızca Vercel'in kendi kenar ağı
 * tarafından yazılır ve istemci tarafından ezilemez. Onun yokluğunda
 * `x-forwarded-for` zincirinin İLK değil SON öğesi alınır — zincire istemci
 * baştan ekleme yapabilir, sona ekleme yapamaz.
 */
export function clientIp(headerList: Headers): string {
  const vercel = headerList.get('x-vercel-forwarded-for')?.trim()
  if (vercel) return vercel.split(',')[0].trim()

  const chain = headerList.get('x-forwarded-for')
  if (chain) {
    const parts = chain.split(',').map((p) => p.trim()).filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1]
  }

  return headerList.get('x-real-ip')?.trim() || 'unknown'
}
