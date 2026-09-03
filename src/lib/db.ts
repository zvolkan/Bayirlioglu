import { getCloudflareContext } from '@opennextjs/cloudflare'
import { cache } from 'react'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Veritabanı istemcisi — Cloudflare Workers sürümü.
 *
 * ── Neden değişti ───────────────────────────────────────────────────────────
 *
 * Eski hâli modül seviyesinde tek bir `PrismaClient` tutuyordu. Workers'ta bu
 * iki nedenle çalışmaz:
 *
 *   1. Bağlantı dizesi `env.HYPERDRIVE.connectionString` üzerinden geliyor ve
 *      `env` yalnızca istek bağlamında erişilebilir. Modül yüklenirken yok.
 *   2. Postgres sürücüsü bir bağlantı havuzu kuruyor ve aynı bağlantıyı birden
 *      çok istekte kullanıyor. Cloudflare Workers buna izin vermiyor.
 *
 * Çözüm: istemci istek başına kuruluyor, `maxUses: 1` ile bağlantı yeniden
 * kullanımı kapatılıyor, React `cache()` ile de aynı istek içinde tek bir
 * örnek paylaşılıyor.
 *
 * ── Çağrı yerleri neden değişmedi ───────────────────────────────────────────
 *
 * Aşağıdaki `prisma` bir Proxy. Her özellik erişiminde (`prisma.order`,
 * `prisma.$transaction` …) o anki isteğin istemcisini bulup ona yönlendiriyor.
 * Böylece kod tabanındaki onlarca `import { prisma } from '@/lib/db'` satırı
 * ve `prisma.order.findMany(...)` çağrısı olduğu gibi kaldı.
 *
 * ── DİKKAT: derleme zamanı (SSG/ISR) ────────────────────────────────────────
 *
 * `getCloudflareContext()` senkron sürümü derleme sırasında ÇALIŞMAZ. Statik
 * üretim sırasında veritabanına giden yerler — bu projede `src/app/sitemap.ts`
 * ve varsa `generateStaticParams` kullanan sayfalar — aşağıdaki `getDbAsync()`
 * fonksiyonunu kullanmalı. Aksi hâlde `next build` sırasında hata alırsınız.
 *
 * ── Bilinen açık sorun ──────────────────────────────────────────────────────
 *
 * Prisma + Hyperdrive birlikteliğinde çözülmemiş bir hata kaydı var
 * (prisma/prisma#28193): istemci yeniden kullanıldığında worker askıda
 * kalabiliyor. `maxUses: 1` bunun için konuldu. Yayına almadan önce ödeme ve
 * sipariş akışını yük altında test edin.
 */

function istemciKur(connectionString: string): PrismaClient {
  const adapter = new PrismaPg({
    connectionString,
    // Bağlantıyı bir kez kullan, sonra bırak. Workers'ta istekler arası
    // bağlantı paylaşımı yasak; Hyperdrive havuzlamayı zaten ağ seviyesinde
    // yaptığı için performans kaybı yok.
    maxUses: 1,
  })
  return new PrismaClient({ adapter })
}

/**
 * İstek içindeki veritabanı istemcisi.
 * `cache()` sayesinde aynı istek boyunca tek bir örnek döner.
 */
export const getDb = cache((): PrismaClient => {
  const { env } = getCloudflareContext()
  return istemciKur(env.HYPERDRIVE.connectionString)
})

/**
 * Statik üretim (SSG/ISR) ve derleme zamanı için.
 * `sitemap.ts` gibi istek bağlamı olmayan yerlerde bunu kullanın.
 */
export async function getDbAsync(): Promise<PrismaClient> {
  const { env } = await getCloudflareContext({ async: true })
  return istemciKur(env.HYPERDRIVE.connectionString)
}

/**
 * Var olan çağrı yerlerinin çalışmaya devam etmesi için ince bir sarmalayıcı.
 * `prisma.order.findMany(...)` yazan her yer değişmeden çalışır.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_hedef, ozellik, alici) {
    const db = getDb()
    const deger = Reflect.get(db, ozellik, alici)
    return typeof deger === 'function' ? deger.bind(db) : deger
  },
})

/**
 * `$transaction` geri çağrısına gelen istemcinin tipi.
 * Kod tabanında `async (tx: TransactionClient) => { ... }` şeklinde kullanılıyor.
 */
export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>
