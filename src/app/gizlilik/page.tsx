import type { Metadata } from 'next'
import Link from 'next/link'
import { BRAND } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: `${BRAND.name} gizlilik politikası ve kişisel verilerin korunması hakkında bilgi.`,
}

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-900">Ana Sayfa</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Gizlilik Politikası</span>
        </nav>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gizlilik Politikası</h1>
          <p className="text-sm text-gray-500 mb-8">Son güncelleme: Ocak 2025</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Genel Bilgi</h2>
              <p className="text-gray-600 leading-relaxed">
                Bayırlıoğlu Grup olarak, müşterilerimizin kişisel verilerinin güvenliği ve gizliliğine büyük önem veriyoruz.
                Bu Gizlilik Politikası, sitemizi ziyaret ettiğinizde veya hizmetlerimizden faydalandığınızda
                kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
                6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hazırlanmıştır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Toplanan Kişisel Veriler</h2>
              <p className="text-gray-600 leading-relaxed mb-3">Sitemizi kullanırken aşağıdaki kişisel verileri toplayabiliriz:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                <li>Ad, soyad, e-posta adresi ve telefon numarası</li>
                <li>Teslimat ve fatura adresi bilgileri</li>
                <li>Sipariş geçmişi ve alışveriş tercihleri</li>
                <li>IP adresi, tarayıcı türü ve cihaz bilgileri</li>
                <li>Çerezler aracılığıyla toplanan kullanım verileri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Verilerin Kullanım Amaçları</h2>
              <p className="text-gray-600 leading-relaxed mb-3">Kişisel verilerinizi şu amaçlarla kullanıyoruz:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                <li>Siparişlerinizi işlemek ve teslimat sürecini yönetmek</li>
                <li>Müşteri hizmetleri sunmak ve sorularınızı yanıtlamak</li>
                <li>Kampanya ve fırsatlar hakkında bilgilendirme yapmak (onayınız dahilinde)</li>
                <li>Site güvenliğini ve doğruluğunu sağlamak</li>
                <li>Yasal yükümlülüklerimizi yerine getirmek</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Verilerin Paylaşımı</h2>
              <p className="text-gray-600 leading-relaxed">
                Kişisel verilerinizi, siparişlerinizin teslimatını gerçekleştiren kargo firmaları,
                ödeme işlemlerini yürüten bankalar ve yasal zorunluluk durumunda yetkili makamlarla paylaşabiliriz.
                Kişisel verileriniz hiçbir koşulda ticari amaçla üçüncü taraflara satılmaz veya kiralanmaz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Çerezler (Cookies)</h2>
              <p className="text-gray-600 leading-relaxed">
                Sitemizde deneyiminizi geliştirmek için çerezler kullanılmaktadır. Zorunlu çerezler sitenin
                çalışması için gereklidir; analitik ve pazarlama çerezleri ise tarayıcı ayarlarınızdan
                devre dışı bırakılabilir. Çerezleri reddetmeniz durumunda bazı özellikler düzgün çalışmayabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Veri Güvenliği</h2>
              <p className="text-gray-600 leading-relaxed">
                Kişisel verilerinizi yetkisiz erişim, değişiklik, ifşa veya imhaya karşı korumak için
                SSL şifreleme, güvenli sunucular ve düzenli güvenlik denetimleri gibi teknik ve idari
                güvenlik önlemleri uygulamaktayız.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Haklarınız</h2>
              <p className="text-gray-600 leading-relaxed mb-3">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>Verilerinize erişim ve bunların düzeltilmesini talep etme</li>
                <li>Verilerinizin silinmesini veya yok edilmesini isteme</li>
                <li>Otomatik sistemlerle işlenen veriler nedeniyle aleyhinize oluşan sonuçlara itiraz etme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. İletişim</h2>
              <p className="text-gray-600 leading-relaxed">
                Gizlilik politikamız hakkında sorularınız veya kişisel verilerinizle ilgili talepleriniz için{' '}
                <Link href="/iletisim" className="text-green-600 hover:underline">İletişim</Link> sayfamızdan
                bize ulaşabilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
