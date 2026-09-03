import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getDb } from '@/lib/db'

/**
 * GEÇİCİ TANI UCU — göç doğrulandıktan sonra bu dosyayı silin.
 *
 * ── Neden var ───────────────────────────────────────────────────────────────
 *
 * Cloudflare log'unda Prisma hatası yalnızca yığın izi olarak görünüyor
 * (`handleRequestError` → `handleAndLogRequestError` → `request`), hata
 * MESAJI görünmüyor. Mesaj olmadan "Hyperdrive bağlanamıyor mu, şema mı
 * uyuşmuyor, hazır ifade çakışması mı" ayırt edilemiyor.
 *
 * Bu uç nokta aynı sorguları adım adım çalıştırıp hatayı OKUNABİLİR biçimde
 * döndürüyor: ad, mesaj, Prisma hata kodu ve varsa `cause`.
 *
 * ── Neden korumalı ──────────────────────────────────────────────────────────
 *
 * Çıktı bağlantı dizesinin biçimini ve veritabanı yapısını ele veriyor.
 * `CRON_SECRET` ile korunuyor ve `CRON_SECRET` tanımsızsa kapalı (fail-closed).
 */

export const dynamic = 'force-dynamic'

/** Hatayı JSON'a çevrilebilir hâle getirir — Error nesnesi doğrudan serileşmiyor */
function hataOzeti(e: unknown): Record<string, unknown> {
  if (!(e instanceof Error)) return { tip: typeof e, deger: String(e) }

  const p = e as Error & { code?: unknown; errorCode?: unknown; meta?: unknown }

  return {
    ad: e.name,
    mesaj: e.message,
    kod: p.code ?? p.errorCode ?? null,
    meta: p.meta ?? null,
    sebep: e.cause instanceof Error ? { ad: e.cause.name, mesaj: e.cause.message } : (e.cause ?? null),
    yigin: e.stack?.split('\n').slice(0, 6).join('\n') ?? null,
  }
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()

  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET tanımlı değil.' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  const rapor: Record<string, unknown> = {}

  // ── 1. Bağlama duruyor mu, bağlantı dizesi hangi sunucuyu gösteriyor ──────
  try {
    const { env } = getCloudflareContext()
    const hd = env.HYPERDRIVE

    if (!hd) {
      rapor.baglama = 'YOK — wrangler.jsonc içindeki hyperdrive bağlaması çözülmemiş'
      return NextResponse.json(rapor, { status: 500 })
    }

    // Parolayı ASLA yazdırmıyoruz; yalnızca host/port/veritabanı adı.
    const u = new URL(hd.connectionString)
    rapor.baglama = {
      host: u.hostname,
      port: u.port,
      veritabani: u.pathname.replace(/^\//, ''),
      kullanici: u.username,
      parolaVarMi: u.password.length > 0,
    }
  } catch (e) {
    rapor.baglama = hataOzeti(e)
    return NextResponse.json(rapor, { status: 500 })
  }

  const db = getDb()

  // ── 2. En basit sorgu: ağ + kimlik doğrulama çalışıyor mu ─────────────────
  try {
    rapor.selectBir = await db.$queryRawUnsafe('select 1 as x')
  } catch (e) {
    rapor.selectBir = hataOzeti(e)
    return NextResponse.json(rapor, { status: 500 })
  }

  // ── 3. Şema görünüyor mu ──────────────────────────────────────────────────
  try {
    rapor.tabloSayisi = await db.$queryRawUnsafe(
      "select count(*)::int as n from information_schema.tables where table_schema = 'public'",
    )
  } catch (e) {
    rapor.tabloSayisi = hataOzeti(e)
  }

  // ── 4. Gerçek bir Prisma modeli — marka sayfasının yaptığı işin özeti ─────
  try {
    rapor.urunSayisi = await db.product.count()
  } catch (e) {
    rapor.urunSayisi = hataOzeti(e)
  }

  // ── 5. Aynı istekte ikinci sorgu — maxUses:1 sonrası yeniden kullanım ─────
  try {
    rapor.ikinciSorgu = await db.product.count()
  } catch (e) {
    rapor.ikinciSorgu = hataOzeti(e)
  }

  return NextResponse.json(rapor)
}
