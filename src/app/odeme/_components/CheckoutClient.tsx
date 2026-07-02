'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'

const KARGO_LIMIT = 500
const KARGO_UCRETI = 29.90

type SavedAddress = {
  id: string
  label: string
  fullName: string
  phone: string
  line1: string
  line2: string | null
  district: string
  city: string
  postalCode: string | null
  isDefault: boolean
}

type Props = {
  addresses: SavedAddress[]
}

function formatPrice(n: number) {
  return n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
}

// ── Sözleşme metinleri ────────────────────────────────────────────────────────

const ON_BILGILENDIRME = `ÖN BİLGİLENDİRME FORMU

1. TARAFLAR VE KONU
İşbu Ön Bilgilendirme Formu'nun konusu, Alıcı ile Satıcı arasındaki Sözleşme'ye ilişkin Kanun ve Yönetmelik hükümleri uyarınca bilgilendirilmesidir. Ayrıca Yönetmelik uyarınca yer verilmesi zorunlu olan hususlar Ön Bilgilendirme Formu'nda yer almaktadır.

2. TANIMLAR
Ön Bilgilendirme Formu ve Sözleşme'nin uygulanmasında ve yorumlanmasında aşağıda yazılı terimler karşılarındaki yazılı açıklamaları ifade edeceklerdir.

ALICI: Mal veya Hizmeti ticari veya mesleki olmayan amaçlarla edinen, kullanan veya yararlanan gerçek kişiyi,
SATICI: Bayırlıoğlu Grup (bayirlioglu-6rv9.vercel.app) üzerinden satış yapan firmayı,
SİTE: bayirlioglu-6rv9.vercel.app adresini,

3. SATICI BİLGİLERİ
Ticaret Unvanı: Bayırlıoğlu Grup
E-posta: info@bayirlioglu.com
Web Adresi: bayirlioglu-6rv9.vercel.app

4. TEMEL ÖZELLİKLER
Mal veya Hizmetin temel nitelikleri Site'de yayınlanan ürün/hizmet sayfalarında belirtilmektedir. Kampanya süresince geçerli olan satış fiyatı Siparişinizi verdiğiniz tarihteki fiyattır.

5. ÖDEME ve TESLİMAT
Sipariş toplamı, seçilen ödeme yöntemi ile tahsil edilecektir. Teslimat, sipariş onayından itibaren en geç 3-7 iş günü içinde gerçekleştirilecektir.

6. KİŞİSEL VERİLERİN KORUNMASI
Kişisel verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında korunmaktadır.`

const MESAFELI_SATIS = `MESAFELİ SATIŞ SÖZLEŞMESİ

1. TARAFLAR
İşbu Mesafeli Satış Sözleşmesi ("Sözleşme"), Alıcı ile Satıcı arasında aşağıda belirtilen hüküm ve şartlar çerçevesinde elektronik ortamda kurulmuştur.

SATICI:
Ticaret Unvanı: Bayırlıoğlu Grup
Adres: Anamur, Mersin
E-posta: info@bayirlioglu.com

ALICI: Sipariş sırasında beyan edilen ad-soyad, adres ve iletişim bilgilerine sahip kişi.

2. KONU
İşbu Sözleşme, Alıcının, Satıcı'ya ait bayirlioglu-6rv9.vercel.app internet sitesinden elektronik ortamda siparişini verdiği ürünlerin satışı ve teslimatına ilişkin olarak 6502 sayılı Tüketicinin Korunması Hakkındaki Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerini düzenlemektedir.

3. ÜRÜN BİLGİLERİ
Malın/Ürünün temel özellikleri (türü, miktarı, marka/modeli, rengi, adedi) Satıcı'ya ait internet sitesinde yayınlanmaktadır. Kampanya tarihine kadar geçerli olan satış fiyatı sipariş formunda belirtilmektedir.

4. GENEL HÜKÜMLER
4.1. Alıcı, Satıcı'ya ait internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimat ve kargo masraflarına ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.

4.2. Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için Alıcı'nın sipariş formundaki adresine, kargo şirketi aracılığıyla teslim edilecektir.

4.3. Sözleşme konusu ürün, Alıcı'dan başka bir kişi/kuruluşa teslim edilecek ise, teslim edilecek kişi/kuruluşun teslimatı kabul etmemesinden Satıcı sorumlu tutulamaz.

5. CAYMA HAKKI
Alıcı, 14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkı süresi, hizmet ifasına ilişkin sözleşmelerde sözleşmenin kurulduğu gün; mal teslimine ilişkin sözleşmelerde ise tüketicinin veya tüketici tarafından belirlenen üçüncü kişinin malı teslim aldığı gün başlar.`

const CAYMA_HAKKI = `CAYMA HAKKI

Cayma Hakkı Nedir? Nasıl Kullanılır?
7/11/2013 tarihli ve 6502 sayılı Tüketicinin Korunması Hakkında Kanunun 48 inci ve 84 üncü maddelerine dayanılarak hazırlanmış olan Mesafeli Sözleşmeler Yönetmeliği'nin ("Yönetmelik") 9. maddesi uyarınca:

Alıcı, on dört gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.

Cayma Hakkının İstisnaları
Bununla birlikte aynı Yönetmeliği'nin 15. maddesi ile cayma hakkının kullanılamayacağı istisna durumlar belirtilmiştir. Bu istisna durumlar çerçevesinde Alıcı, sözleşme konusu Ürün bakımından Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinde cayma hakkının kullanılabileceği ürünlerin istisnalarını yer almaktadır.

Cayma Hakkı Kullanılabilecek Ürünleri Nasıl İade Ederim?
1. "Hesabım" > "Siparişlerim" > "Sipariş detay" adımlarını takip edin.
2. İade etmek istediğiniz ürünü seçerek iade talebinde bulunun.
3. Ürünü orijinal ambalajında, faturasıyla birlikte kargo ile gönderin.
4. İadeniz onaylandıktan sonra ödemeniz 3-7 iş günü içinde iade edilir.

İletişim
Cayma hakkı ve iade işlemleri için: info@bayirlioglu.com`

// ─────────────────────────────────────────────────────────────────────────────

export default function CheckoutClient({ addresses }: Props) {
  const items = useCartStore((s: { items: import('@/lib/types').CartItem[] }) => s.items)
  const clearCart = useCartStore((s: { clearCart: () => void }) => s.clearCart)

  const subtotal = items.reduce(
    (sum: number, item: import('@/lib/types').CartItem) =>
      sum + (item.product.salePrice ?? item.product.price) * item.quantity,
    0
  )
  const cargoFee = subtotal >= KARGO_LIMIT ? 0 : KARGO_UCRETI
  const total = parseFloat((subtotal + cargoFee).toFixed(2))

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ''
  )
  const [contractApproved, setContractApproved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [iyzicoHtml, setIyzicoHtml] = useState<string | null>(null)
  const scriptContainerRef = useRef<HTMLDivElement>(null)

  // Inject İyzico script when HTML is ready
  useEffect(() => {
    if (!iyzicoHtml || !scriptContainerRef.current) return
    const container = scriptContainerRef.current
    container.innerHTML = iyzicoHtml
    container.querySelectorAll('script').forEach((oldScript: HTMLScriptElement) => {
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach((attr: Attr) =>
        newScript.setAttribute(attr.name, attr.value)
      )
      newScript.textContent = oldScript.textContent
      oldScript.parentNode?.replaceChild(newScript, oldScript)
    })
  }, [iyzicoHtml])

  // Empty cart guard
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🛒</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sepetiniz boş</h1>
          <p className="text-gray-500 text-sm mb-6">Ödeme yapabilmek için sepetinize ürün ekleyin.</p>
          <Link href="/" className="inline-block px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors">
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    )
  }

  const brandKey = items[0]?.product.brand ?? 'alb-tarim'

  const handleSubmit = async () => {
    setError(null)

    if (!selectedAddressId) {
      setError('Lütfen bir teslimat adresi seçin.')
      return
    }
    if (!contractApproved) {
      setError('Devam etmek için sözleşmeleri onaylamanız gerekiyor.')
      return
    }

    const addr = addresses.find((a) => a.id === selectedAddressId)
    if (!addr) { setError('Adres bulunamadı.'); return }

    setLoading(true)

    try {
      const cartItems = items.map((item: import('@/lib/types').CartItem) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.salePrice ?? item.product.price,
        quantity: item.quantity,
      }))

      const addressData = {
        savedAddressId: addr.id,
        fullName: addr.fullName,
        line1: addr.line1,
        line2: addr.line2 ?? undefined,
        district: addr.district,
        city: addr.city,
      }

      const res = await fetch('/api/odeme/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, addressData, brandKey }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Ödeme başlatılamadı.')
        setLoading(false)
        return
      }

      clearCart()
      setIyzicoHtml(data.checkoutFormContent)
    } catch {
      setError('Bir hata oluştu, lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  // İyzico overlay
  if (iyzicoHtml) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Güvenli ödeme penceresi açılıyor…</p>
          <p className="text-gray-400 text-sm mt-1">Lütfen bekleyin</p>
        </div>
        <div ref={scriptContainerRef} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Ödeme</h1>
          <p className="text-gray-500 text-sm mt-0.5">Teslimat adresinizi seçin ve sözleşmeleri onaylayın.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* SOL */}
          <div className="lg:col-span-2 space-y-5">

            {/* Adres */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Teslimat Adresi</h2>

              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm mb-3">Kayıtlı adresiniz yok.</p>
                  <Link
                    href="/hesabim/adres-ekle"
                    className="inline-block px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Adres Ekle
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        selectedAddressId === addr.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-0.5 accent-gray-900"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-gray-900 text-sm">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Varsayılan</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{addr.fullName}</p>
                        <p className="text-sm text-gray-500">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.district} / {addr.city}
                        </p>
                        <p className="text-sm text-gray-400">{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                  <Link
                    href="/hesabim/adres-ekle"
                    className="inline-block text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                  >
                    + Yeni adres ekle
                  </Link>
                </div>
              )}
            </div>

            {/* Sözleşmeler */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-5">Sözleşmeler ve Formlar</h2>

              <div className="space-y-4">
                {/* Ön Bilgilendirme */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Ön Bilgilendirme Formu</h3>
                  <div className="h-36 overflow-y-auto border border-gray-200 rounded-xl p-3 text-xs text-gray-500 leading-relaxed whitespace-pre-line bg-gray-50">
                    {ON_BILGILENDIRME}
                  </div>
                </div>

                {/* Mesafeli Satış */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Mesafeli Satış Sözleşmesi</h3>
                  <div className="h-36 overflow-y-auto border border-gray-200 rounded-xl p-3 text-xs text-gray-500 leading-relaxed whitespace-pre-line bg-gray-50">
                    {MESAFELI_SATIS}
                  </div>
                </div>

                {/* Cayma Hakkı */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Cayma Hakkı</h3>
                  <div className="h-36 overflow-y-auto border border-gray-200 rounded-xl p-3 text-xs text-gray-500 leading-relaxed whitespace-pre-line bg-gray-50">
                    {CAYMA_HAKKI}
                  </div>
                </div>

                {/* Onay checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group mt-2">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={contractApproved}
                      onChange={(e) => setContractApproved(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      contractApproved ? 'bg-gray-900 border-gray-900' : 'border-gray-300 group-hover:border-gray-500'
                    }`}>
                      {contractApproved && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold">Ön Bilgilendirme Koşulları</span>'nı ve{' '}
                    <span className="font-semibold">Mesafeli Satış Sözleşmesi</span>'ni okudum, onaylıyorum.
                  </span>
                </label>
              </div>
            </div>

            {/* Güvenlik notu */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
              <span className="text-xl flex-shrink-0">🔒</span>
              <span>Ödemeniz İyzico güvencesiyle SSL şifreli bağlantı üzerinden gerçekleşir. Kart bilgileriniz sitemizde saklanmaz.</span>
            </div>
          </div>

          {/* SAĞ — Özet */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map((item: import('@/lib/types').CartItem) => {
                  const price = item.product.salePrice ?? item.product.price
                  return (
                    <div key={item.product.id} className="flex justify-between text-sm gap-2">
                      <span className="text-gray-600 truncate flex-1">
                        {item.product.name}
                        <span className="text-gray-400 ml-1">×{item.quantity}</span>
                      </span>
                      <span className="font-medium text-gray-900 whitespace-nowrap flex-shrink-0">
                        {formatPrice(price * item.quantity)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span className={cargoFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {cargoFee === 0 ? 'Ücretsiz' : formatPrice(cargoFee)}
                  </span>
                </div>
                {subtotal < KARGO_LIMIT && (
                  <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-2.5 py-1.5">
                    {formatPrice(KARGO_LIMIT - subtotal)} daha ekleyin, kargo ücretsiz!
                  </p>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Toplam</span>
                  <span className="font-bold text-lg text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !contractApproved || addresses.length === 0}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ödeme Başlatılıyor…
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    Güvenli Ödemeye Geç
                  </>
                )}
              </button>

              {!contractApproved && (
                <p className="text-xs text-amber-600 text-center mt-2">
                  Ödeme için sözleşmeleri onaylayın
                </p>
              )}

              <p className="text-xs text-gray-400 text-center mt-2">
                İyzico güvencesiyle korunan ödeme
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
