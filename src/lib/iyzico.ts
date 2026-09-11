/**
 * iyzico istemcisi — `fetch` tabanlı.
 *
 * ── Neden kütüphane kullanılmıyor ───────────────────────────────────────────
 *
 * `iyzipay` npm paketi Cloudflare Workers'ta ÇALIŞAMAZ. Sebep, paketin
 * kurulum kodunda (`lib/Iyzipay.js`):
 *
 *     var modelsPath = __dirname + '/resources';
 *     fs.readdirSync(modelsPath).forEach(function (fileName) {
 *         var resource = require(modelsPath + '/' + fileName);
 *
 * `new Iyzipay(...)` her çağrıldığında kütüphane kendi kaynak klasörünü
 * DİSKTEN okuyup dosyaları tek tek `require` ediyor. Workers'ta gerçek bir
 * dosya sistemi yok; ayrıca hesaplanan yollu `require` ifadesini hiçbir
 * paketleyici statik olarak çözemediği için o dosyalar pakete hiç girmiyor.
 * İstemci kurulamıyor bile.
 *
 * Bu dosya aynı işi doğrudan iyzico REST API'sine `fetch` ile yaparak
 * görüyor. Dışa verilen fonksiyonların imzaları AYNI kaldı; çağıran hiçbir
 * dosya değişmedi.
 *
 * ── Kimlik doğrulama (IYZWSv2) ──────────────────────────────────────────────
 *
 *   signature = HMAC-SHA256(secretKey, randomString + uri + JSON.stringify(body))
 *   params    = "apiKey:<apiKey>&randomKey:<rnd>&signature:<sig>"
 *   header    = "IYZWSv2 " + base64(params)
 *
 * `uri` tam adres değil, yalnızca YOL kısmıdır (örn. `/payment/detail`).
 * İmza gövdenin metin hâli üzerinden hesaplandığı için, imzalanan metnin
 * gönderilen gövdeyle BİREBİR aynı olması gerekir — bu yüzden gövde bir kez
 * `JSON.stringify` edilip hem imzada hem istekte o metin kullanılıyor.
 *
 * HMAC için Web Crypto kullanılıyor (`node:crypto` yerine); hem Workers hem
 * Node ortamında çalışır. Aynı desen `src/lib/admin-auth.ts` içinde de var.
 */

const SANDBOX_URI = 'https://sandbox-api.iyzipay.com'
const PRODUCTION_URI = 'https://api.iyzipay.com'
const CLIENT_VERSION = 'iyzipay-node-2.0.69'

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
    return explicit.replace(/\/+$/, '')
  }
  return process.env.NODE_ENV === 'production' ? PRODUCTION_URI : SANDBOX_URI
}

function getKeys(): { apiKey: string; secretKey: string } {
  const apiKey = process.env.IYZICO_API_KEY
  const secretKey = process.env.IYZICO_SECRET_KEY
  if (!apiKey || !secretKey) {
    throw new Error('IYZICO_API_KEY veya IYZICO_SECRET_KEY eksik.')
  }
  return { apiKey, secretKey }
}

const encoder = new TextEncoder()

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function toBase64(value: string): string {
  // btoa yalnızca latin-1 kabul ediyor; imza parametreleri ASCII olduğu için
  // sorun yok, yine de güvenli tarafta kalmak adına baytlardan üretiyoruz.
  const bytes = encoder.encode(value)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(data)))
}

/** Kütüphanenin ürettiğiyle aynı biçimde rastgele dizi */
function randomString(): string {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  return Date.now().toString() + toHex(bytes.buffer).slice(0, 12)
}

/**
 * iyzico'ya imzalı bir POST atar.
 *
 * `path` yalnızca yol kısmıdır ve imzaya birebir bu değer girer.
 */
async function iyzicoPost(path: string, body: Record<string, unknown>): Promise<any> {
  const { apiKey, secretKey } = getKeys()
  const rnd = randomString()

  // Gövde TEK KEZ metne çevriliyor: imzalanan metinle gönderilen metin
  // birebir aynı olmak zorunda.
  const payload = JSON.stringify(body)

  const signature = await hmacSha256Hex(secretKey, rnd + path + payload)
  const authorization =
    'IYZWSv2 ' +
    toBase64(`apiKey:${apiKey}&randomKey:${rnd}&signature:${signature}`)

  let res: Response
  try {
    res = await fetch(resolveUri() + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
        'x-iyzi-rnd': rnd,
        'x-iyzi-client-version': CLIENT_VERSION,
      },
      body: payload,
    })
  } catch (error) {
    // Ağ hatası — çağıranlar bunu yakalayıp siparişi askıda bırakıyor
    throw new Error(`iyzico'ya ulaşılamadı (${path}): ${String(error).slice(0, 200)}`)
  }

  const text = await res.text()

  let parsed: any
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error(
      `iyzico beklenmeyen yanıt verdi (${path}, HTTP ${res.status}): ${text.slice(0, 300)}`,
    )
  }

  // iyzico hataları da HTTP 200 ile döner ve gövdede `status: "failure"` olur.
  // Bu yüzden HTTP durumuna göre hata FIRLATMIYORUZ — çağıran kod zaten
  // `result.status` kontrolü yapıyor ve `errorMessage` alanını okuyor.
  // Yalnızca 5xx'te fırlatıyoruz; orada gövde anlamlı olmayabilir.
  if (res.status >= 500) {
    throw new Error(
      `iyzico sunucu hatası (${path}, HTTP ${res.status}): ` +
        `${parsed?.errorMessage ?? text.slice(0, 200)}`,
    )
  }

  return parsed
}

// ─── Uç noktalar ─────────────────────────────────────────────────────────────
// Yollar iyzipay paketinin resources/ klasöründen birebir alındı.

export function initializeCheckoutForm(request: Record<string, unknown>): Promise<any> {
  return iyzicoPost('/payment/iyzipos/checkoutform/initialize/auth/ecom', request)
}

/**
 * Ödeme sonucunu üç kovaya ayırır: BAŞARILI, KESİN RET, BELİRSİZ.
 *
 * ── Neden gerekli ───────────────────────────────────────────────────────────
 *
 * iyzico hatalarını da HTTP 200 ile, gövdede `status: "failure"` olarak
 * döndürüyor. `iyzicoPost` yalnızca HTTP 500 ve üzerinde hata fırlattığı için,
 * callback tarafında "başarılı değilse başarısızdır" diye tek bir ayrım vardı
 * ve başarılı olmayan HER durum siparişi koşulsuz CANCELLED yapıyordu.
 *
 * Oysa "başarılı değil" ile "başarısız" aynı şey değil. Aradaki fark para:
 * 3DS tamamlanmış, banka tutarı çekmiş, ama iyzico o an geçici bir sistem
 * hatası ya da hız sınırı döndürmüşse, müşteriye "ödeme başarısız" denip
 * sipariş iptal ediliyordu. Müşteri büyük ihtimalle ikinci kez ödüyor ve
 * birinci tahsilatın sistemde hiçbir izi kalmıyordu.
 *
 * ── Sınıflandırma kuralı ────────────────────────────────────────────────────
 *
 * KESİN RET yalnızca ELİMİZDE KANIT VARSA verilir: ya `paymentStatus`
 * doğrudan FAILURE'dır, ya da errorCode bilinen bir kart reddidir (limit
 * yetersiz, kart kapalı, hatalı CVC gibi). Bunların hiçbirinde para çekilmez.
 *
 * Geri kalan her şey — bilinmeyen hata kodu, 3DS ara durumları, boş yanıt,
 * sistem hatası — BELİRSİZ sayılır. Belirsizde sipariş iptal EDİLMEZ: PENDING
 * kalır, not düşülür, müşteriye "doğrulanıyor" gösterilir.
 *
 * Bedeli şu: gerçekten ödenmemiş bazı siparişler bir süre PENDING'de bekler.
 * Bekleyen sipariş temizliği onları zaten belirli bir süre sonra iptal edip
 * stoğu geri veriyor. Yani belirsizi beklemeye almanın maliyeti gecikme;
 * yanlış iptal etmenin maliyeti müşterinin parası.
 */
export type OdemeSonucu = 'basarili' | 'kesin-ret' | 'belirsiz'

/**
 * Kart reddi anlamına gelen iyzico hata kodları. Hepsinde işlem bankada
 * reddedilmiştir; tahsilat OLMAZ, dolayısıyla iptal güvenlidir.
 *
 * Liste bilinçli olarak dar tutuldu: bir kod burada yoksa belirsiz sayılıyor
 * ve sipariş beklemeye alınıyor. Yanlış tarafa düşmenin bedeli asimetrik —
 * fazladan bekleyen sipariş zararsız, yanlış iptal edilen ödeme değil.
 */
const KART_REDDI_KODLARI = new Set([
  '10051', // Yetersiz bakiye
  '10005', // İşlem onaylanmadı (do not honour)
  '10012', // Geçersiz işlem
  '10041', // Karta el koy
  '10043', // Çalıntı kart
  '10054', // Vadesi dolmuş kart
  '10084', // CVC hatalı
  '10093', // Kart kapalı / kullanıma kapalı
  '10201', // Kart limiti yetersiz
  '10202', // Kart sahibi doğrulanamadı
  '10207', // Karta işlem izni yok
  '10211', // Kart sahibi 3DS doğrulamasını tamamlamadı
  '10051-3D',
])

export function odemeSonucunuSiniflandir(result: unknown): OdemeSonucu {
  const r = (result ?? {}) as {
    status?: unknown
    paymentStatus?: unknown
    errorCode?: unknown
  }

  const status = String(r.status ?? '')
  const paymentStatus = String(r.paymentStatus ?? '')
  const errorCode = String(r.errorCode ?? '')

  if (status === 'success' && paymentStatus === 'SUCCESS') return 'basarili'

  // iyzico "sorgu başarılı" diyor ve ödeme durumunu FAILURE olarak bildiriyor:
  // bu kesin bilgi.
  if (status === 'success' && paymentStatus === 'FAILURE') return 'kesin-ret'

  // Sorgu başarısız; yalnızca bilinen bir kart reddiyse kesin sayıyoruz.
  if (status === 'failure' && KART_REDDI_KODLARI.has(errorCode)) return 'kesin-ret'

  return 'belirsiz'
}

export function retrieveCheckoutForm(token: string, conversationId: string): Promise<any> {
  return iyzicoPost('/payment/iyzipos/checkoutform/auth/ecom/detail', {
    locale: 'tr',
    conversationId,
    token,
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
  return iyzicoPost('/v2/payment/refund', {
    locale: 'tr',
    conversationId: params.conversationId,
    paymentId: params.paymentId,
    price: params.price,
    currency: 'TRY',
    ip: params.ip ?? '127.0.0.1',
  })
}

/** Ödemenin tamamını iptal eder (aynı gün içinde, henüz kapanmamış işlemler için) */
export function cancelPayment(params: {
  paymentId: string
  conversationId: string
  ip?: string
}): Promise<any> {
  return iyzicoPost('/payment/cancel', {
    locale: 'tr',
    conversationId: params.conversationId,
    paymentId: params.paymentId,
    ip: params.ip ?? '127.0.0.1',
  })
}

/**
 * Korumalı Alışveriş — kalem onayı (teslimat bildirimi).
 *
 * iyzico'nun standart tek satıcılı akışında teslimat bildirimi diye bir adım
 * YOKTUR; para, hesabınızın ödeme takvimine göre otomatik aktarılır. Bu uç
 * nokta yalnızca **Korumalı Alışveriş** (pazaryeri / escrow) modeli açık olan
 * hesaplarda anlamlıdır: orada para, siz kalemi onaylayana kadar iyzico'da
 * bekletilir.
 *
 * DİKKAT: `paymentTransactionId` sepet KALEMİNE ait kimliktir, `paymentId`
 * değildir. İkisi karıştırılırsa iyzico "işlem bulunamadı" döner.
 */
export function approvePaymentItem(params: {
  paymentTransactionId: string
  conversationId: string
}): Promise<any> {
  return iyzicoPost('/payment/iyzipos/item/approve', {
    locale: 'tr',
    conversationId: params.conversationId,
    paymentTransactionId: params.paymentTransactionId,
  })
}

/**
 * Ödeme detayını `paymentId` ile çeker.
 *
 * `itemTransactions` dizisi burada da geliyor; kalem işlem kimlikleri
 * kaydedilmeden önce oluşturulmuş siparişler için tek geri kazanma yolu bu.
 */
export function retrievePayment(params: {
  paymentId: string
  conversationId: string
}): Promise<any> {
  return iyzicoPost('/payment/detail', {
    locale: 'tr',
    conversationId: params.conversationId,
    paymentId: params.paymentId,
  })
}
