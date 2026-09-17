import { NextResponse } from 'next/server'
import { timingSafeEqualHash } from '@/lib/admin-auth'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEÇİCİ TEŞHİS UCU — sorun çözülünce BU DOSYAYI SİLİN.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Neden var ───────────────────────────────────────────────────────────────
 *
 * Canlı iyzico ucuna yapılan istekler Worker'dan 522/525 alıyor, ama aynı uç
 * normal bir bilgisayardan sorunsuz JSON döndürüyor. Hata sayfalarının
 * `server: cloudflare` ve `cf-ray: ...-AMS` başlıkları taşıması, yanıtı
 * Cloudflare'in ürettiğini gösteriyor.
 *
 * Bu noktada iki ihtimal var ve ikisi için yapılacaklar tamamen farklı:
 *
 *   A) iyzico'nun sunucusu Cloudflare'in Amsterdam ağından erişilemiyor.
 *      → Çözüm iyzico'da. Bizim yapabileceğimiz bir şey yok.
 *
 *   B) Sorun isteğin ÖZEL ALAN ADI rotası üzerinden çıkmasıyla ilgili.
 *      Cloudflare topluluğunda aynı belirtiyi bildiren kayıtlar var: aynı
 *      Worker `workers.dev` adresinden çağrıldığında dış istek başarılı,
 *      özel alan adı rotasından çağrıldığında 525 dönüyor.
 *      → Çözüm Cloudflare tarafında; destek kaydı açmak gerekiyor.
 *
 * Bu uç, ikisini ayırt etmek için var. Aynı isteği iki adresten de yapıp
 * sonuçları karşılaştırın:
 *
 *   curl -H "x-tani: SIRRINIZ" https://bayirlioglu.com/api/iyzico-yol-testi
 *   curl -H "x-tani: SIRRINIZ" https://<worker>.<hesap>.workers.dev/api/iyzico-yol-testi
 *
 * Aynı sonuç çıkarsa (A), farklı çıkarsa (B).
 *
 * ── Güvenlik ────────────────────────────────────────────────────────────────
 *
 * Sır SORGU DİZESİNDE DEĞİL, başlıkta bekleniyor: sorgu dizesi tarayıcı
 * geçmişine, erişim kayıtlarına ve Referer başlığına yazılıyor. Daha önce
 * silinen tanı ucunun hatası tam olarak buydu.
 *
 * Yanıtta hiçbir sır, anahtar veya bağlantı dizesi yok — yalnızca iyzico'nun
 * döndürdüğü HTTP durumu ve yanıtın kimden geldiğini gösteren başlıklar.
 *
 * İstek İMZASIZ gönderiliyor. Sağlıklı bir iyzico ucu buna `errorCode: 1009`
 * ("Authorization header string gönderilmesi zorunludur") ile cevap verir;
 * yani 1009 görmek "yol açık" demektir. Hiçbir ödeme başlatılmıyor.
 */

export const dynamic = 'force-dynamic'

const HEDEFLER = [
  { ad: 'canlı', url: 'https://api.iyzipay.com/payment/iyzipos/checkoutform/initialize/auth/ecom' },
  {
    ad: 'sandbox',
    url: 'https://sandbox-api.iyzipay.com/payment/iyzipos/checkoutform/initialize/auth/ecom',
  },
]

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    return NextResponse.json({ error: 'Yapılandırma eksik.' }, { status: 503 })
  }

  const gelen = request.headers.get('x-tani') ?? ''
  if (!(await timingSafeEqualHash(gelen, secret))) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  // ── Çıkış IP'si ─────────────────────────────────────────────────────────
  //
  // Cloudflare Workers'ın sabit bir çıkış IP'si yok; istek, o anda çalıştığı
  // veri merkezinin adresinden çıkıyor. Yine de iyzico'ya "şu IP'den geliyoruz"
  // diyebilmek çok işe yarıyor: güvenlik duvarı kayıtlarında aratacakları
  // somut bir değer oluyor.
  //
  // Yankı servisi bilerek Cloudflare DIŞINDAN seçildi (AWS). Cloudflare'in
  // kendi uçlarına sorulsaydı ağın içinden görünen adres dönerdi, dışarıdan
  // görünen değil.
  const cikisIp = await fetch('https://checkip.amazonaws.com', { method: 'GET' })
    .then((r) => r.text())
    .then((t) => t.trim())
    .catch((e) => `okunamadı: ${String(e).slice(0, 120)}`)

  const sonuclar = await Promise.all(
    HEDEFLER.map(async (hedef) => {
      const basladi = Date.now()
      try {
        const res = await fetch(hedef.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        })
        const govde = (await res.text()).slice(0, 200)
        return {
          hedef: hedef.ad,
          durum: res.status,
          sure_ms: Date.now() - basladi,
          server: res.headers.get('server'),
          cfRay: res.headers.get('cf-ray'),
          contentType: res.headers.get('content-type'),
          // 1009 görünüyorsa yol açık demektir.
          govde,
        }
      } catch (error) {
        return {
          hedef: hedef.ad,
          durum: null,
          sure_ms: Date.now() - basladi,
          hata: String(error).slice(0, 200),
        }
      }
    }),
  )

  return NextResponse.json({
    // İsteğin hangi adresten geldiği — özel alan adı mı, workers.dev mi?
    istekAdresi: new URL(request.url).host,
    // Dış dünyanın bizi gördüğü adres. iyzico'ya verilecek değer bu.
    cikisIp,
    zaman: new Date().toISOString(),
    sonuclar,
  })
}
