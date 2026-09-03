// `.open-next/worker.js` derleme çıktısıdır; kaynak ağacında yoktur, bu yüzden
// TypeScript onu bulamaz. Derleme sırasında üretiliyor.
// @ts-ignore — derleme çıktısı olduğu için temiz bir çalışma kopyasında yok,
// derlemeden sonra var. `@ts-expect-error` kullanılamaz: dosya varken
// "kullanılmayan yönerge" hatası verir.
import { default as handler } from './.open-next/worker.js'

/**
 * Worker giriş noktası.
 *
 * OpenNext'in ürettiği worker yalnızca `fetch` handler'ı dışa veriyor. Buraya
 * iki şey daha ekliyoruz: zamanlanmış görev (cron) ve hız sayacı Durable
 * Object'i.
 *
 * ── Cron neden HTTP isteğiyle çalışıyor? ────────────────────────────────────
 *
 * Temizlik işi `cancelAllStalePendingOrders()` fonksiyonunda ve o fonksiyon
 * Prisma üzerinden veritabanına gidiyor. Prisma istemcisi ise istek bağlamına
 * bağlı (bkz. src/lib/db.ts): `getCloudflareContext()` ve React `cache()`
 * yalnızca bir istek içinde doğru çalışıyor. `scheduled` handler'da böyle bir
 * bağlam yok.
 *
 * Fonksiyonu doğrudan çağırmak yerine kendi HTTP uç noktamıza istek atıyoruz.
 * Böylece iş, halihazırda çalıştığı bilinen normal istek yolundan geçiyor ve
 * `src/lib/stale-orders.ts` ile `src/app/api/cron/...` dosyalarına hiç
 * dokunmamış oluyoruz. `CRON_SECRET` kontrolü de anlamını koruyor.
 */

// Durable Object sınıfı buradan dışa verilmeli ki wrangler bağlamayı bulabilsin
export { HizSayaci } from './src/lib/hiz-sayaci'

export default {
  fetch: handler.fetch,

  async scheduled(_controller: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext) {
    const gorev = (async () => {
      const e = env as unknown as { CRON_SECRET?: string; NEXT_PUBLIC_SITE_URL?: string }
      const secret = e.CRON_SECRET

      if (!secret) {
        console.error('[cron] CRON_SECRET tanımlı değil; temizlik çalıştırılmadı.')
        return
      }

      const taban = e.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://bayirlioglu.com'
      const url = new URL('/api/cron/bekleyen-siparisler', taban)

      const self = env.WORKER_SELF_REFERENCE
      if (!self) {
        console.error('[cron] WORKER_SELF_REFERENCE bağlaması yok.')
        return
      }

      try {
        const res = await self.fetch(
          new Request(url, { headers: { authorization: `Bearer ${secret}` } }),
        )
        const govde = await res.text()
        console.log(`[cron] bekleyen sipariş temizliği → ${res.status} ${govde.slice(0, 200)}`)
      } catch (error) {
        console.error('[cron] temizlik isteği başarısız:', error)
      }
    })()

    // waitUntil olmadan handler dönünce iş yarıda kesilebilir
    ctx.waitUntil(gorev)
  },
} satisfies ExportedHandler<CloudflareEnv>
