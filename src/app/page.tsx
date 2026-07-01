import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Bayırlıoğlu Grup — ALB Tarım & Alb Su Teknolojileri',
  description:
    "Bayırlıoğlu Grup bünyesindeki ALB Tarım ve Alb Su Teknolojileri markaları ile tarım, su arıtma ve teknoloji alanlarında Türkiye'ye hizmet veriyoruz.",
  keywords: ['Bayırlıoğlu', 'ALB Tarım', 'Alb Su Teknolojileri', 'su arıtma', 'tarım ürünleri'],
}

// ─── İstatistikler ───────────────────────────────────────────────────────────
const STATS = [
  { value: '20+', label: 'Yıl Deneyim' },
  { value: '16.000+', label: 'Mutlu Müşteri' },
  { value: '81 İl', label: 'Teslimat Ağı' },
  { value: '2', label: 'Güçlü Marka' },
]

// ─── Değerlerimiz ─────────────────────────────────────────────────────────────
const VALUES = [
  {
    icon: '🤝',
    title: 'Güven',
    desc: '20 yılı aşkın süredir binlerce çiftçi ve aile bizimle. Verdiğimiz söz, tuttuğumuz sözdür.',
  },
  {
    icon: '💡',
    title: 'İnovasyon',
    desc: 'En güncel teknoloji ve ürünleri Türk tüketicisiyle buluşturuyoruz.',
  },
  {
    icon: '🌿',
    title: 'Sürdürülebilirlik',
    desc: 'Doğayı koruyarak üretmek, gelecek nesillere sağlıklı bir dünya bırakmak önceliğimizdir.',
  },
  {
    icon: '⭐',
    title: 'Kalite',
    desc: 'Sattığımız her ürün titizlikle seçilir, satış sonrası desteğimiz kesintisiz sürer.',
  },
]

// ─── Ekip / Galeri Placeholder ───────────────────────────────────────────────
const GALLERY_ITEMS = [
  { label: 'Merkez Ofisimiz', aspect: 'aspect-[4/3]' },
  { label: 'Tarım Ekibimiz', aspect: 'aspect-square' },
  { label: 'Teknik Servis', aspect: 'aspect-[4/3]' },
  { label: 'Depo & Lojistik', aspect: 'aspect-square' },
]

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex items-center bg-gray-900 overflow-hidden">
        {/* Arka plan gradient — fotoğraf eklenince bg-image olarak değiştirin */}
        {/* GÖRSEL: /public/images/bayirlioglu-hero.jpg */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.12),transparent_55%)]" />

        <div className="relative z-10 container-main w-full py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Kuruluş yılı rozeti */}
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-sm px-4 py-1.5 rounded-full mb-8 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Türkiye&apos;de 20+ Yıllık Deneyim
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              Bayırlıoğlu
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Grup
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
              Tarımdan teknolojiye, su arıtmadan enerji çözümlerine kadar iki güçlü markamızla
              Türkiye&apos;nin her köşesine hizmet veriyoruz.
            </p>

            {/* Marka seçim kartları — büyük CTA */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Link
                href="/alb-tarim"
                className="group relative flex flex-col items-center gap-3 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-2xl p-7 transition-all duration-300 shadow-xl hover:shadow-green-600/40 hover:-translate-y-1"
              >
                <span className="text-4xl">🌱</span>
                <div>
                  <p className="font-black text-xl">ALB Tarım</p>
                  <p className="text-green-100/80 text-sm mt-1">Gübre · Sulama · Tarım İlaçları</p>
                </div>
                <span className="mt-2 text-sm font-semibold flex items-center gap-1 text-green-100 group-hover:gap-2 transition-all">
                  Keşfet →
                </span>
              </Link>

              <Link
                href="/alb-su-aritma"
                className="group relative flex flex-col items-center gap-3 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl p-7 transition-all duration-300 shadow-xl hover:shadow-blue-600/40 hover:-translate-y-1"
              >
                <span className="text-4xl">💧</span>
                <div>
                  <p className="font-black text-xl">Alb Su Teknolojileri</p>
                  <p className="text-blue-100/80 text-sm mt-1">Su Arıtma · Klima · Elektronik</p>
                </div>
                <span className="mt-2 text-sm font-semibold flex items-center gap-1 text-blue-100 group-hover:gap-2 transition-all">
                  Keşfet →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Alt dalga dekorasyonu */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── İSTATİSTİKLER ── */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="container-main">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BİZ KİMİZ ── */}
      <section className="py-20 bg-gray-50">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Metin */}
            <div>
              <p className="text-green-600 font-bold uppercase text-sm tracking-widest mb-3">
                Kurumsal
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-6">
                Biz Kimiz?
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Bayırlıoğlu Grup, 2000 yılında kurulan ve bugün iki güçlü markasıyla
                  Türkiye&apos;nin önde gelen çok sektörlü ticaret şirketlerinden biridir.
                </p>
                <p>
                  <strong className="text-gray-800">ALB Tarım</strong> markamız altında organik
                  gübre, damla sulama sistemleri ve tarım ilaçlarıyla çiftçilerimize üretimlerini
                  artırma desteği verirken;{' '}
                  <strong className="text-gray-800">Alb Su Teknolojileri</strong> markamızla
                  su arıtma, klima ve akıllı ev elektroniği alanlarında binlerce haneye hizmet
                  sunuyoruz.
                </p>
                <p>
                  Uzman ekibimiz, geniş ürün yelpazemiz ve Türkiye&apos;nin 81 iline ulaşan
                  dağıtım ağımızla müşterilerimizin yanında olmaya devam ediyoruz.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/alb-tarim/hakkimizda"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  🌱 ALB Tarım Hakkında
                </Link>
                <Link
                  href="/alb-su-aritma/hakkimizda"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  💧 Alb Su Hakkında
                </Link>
              </div>
            </div>

            {/* Fotoğraf galerisi placeholder */}
            <div className="grid grid-cols-2 gap-3">
              {GALLERY_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className={`${item.aspect} rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden flex items-end p-3`}
                >
                  {/* GÖRSEL: /public/images/gallery/${item.label.toLowerCase().replace(/ /g, '-')}.jpg */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <p className="relative text-white text-xs font-semibold">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MARKALARIMIZ ── */}
      <section className="py-20 bg-white">
        <div className="container-main">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-bold uppercase text-sm tracking-widest mb-3">
              Markalarımız
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              İki Güçlü Marka, Tek Güvenilir Çatı
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* ALB Tarım */}
            <div className="group rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-8 hover:shadow-xl hover:shadow-green-100 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🌱
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">ALB Tarım</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Organik gübreler, damla sulama sistemleri, tarım ilaçları ve tarım teknolojileri
                ile Türk çiftçisine katma değer sağlıyoruz. 15.000&apos;den fazla çiftçi ailesi
                bizimle büyüdü.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                {['Organik & Kimyasal Gübreler', 'Damla & Yağmurlama Sulama', 'Bitki Koruma Ürünleri', 'Tarım Danışmanlık'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/alb-tarim"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                ALB Tarım&apos;ı Keşfet →
              </Link>
            </div>

            {/* Alb Su Teknolojileri */}
            <div className="group rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                💧
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Alb Su Teknolojileri</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                İleri teknoloji su arıtma cihazları, enerji tasarruflu klima sistemleri ve akıllı
                ev elektroniğiyle yaşam kalitenizi artırıyoruz. 1.000&apos;den fazla başarılı
                kurulum.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                {['RO Su Arıtma Sistemleri', 'Inverter Klima Sistemleri', 'Akıllı Ev Elektroniği', '7/24 Teknik Servis'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/alb-su-aritma"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Alb Su&apos;yu Keşfet →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEĞERLERİMİZ ── */}
      <section className="py-20 bg-gray-900">
        <div className="container-main">
          <div className="text-center mb-14">
            <p className="text-green-400 font-bold uppercase text-sm tracking-widest mb-3">
              Felsefemiz
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Değerlerimiz</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-white text-lg mb-2">{v.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── İLETİŞİM CTA ── */}
      <section className="py-20 bg-white">
        <div className="container-main text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Bizimle İletişime Geçin
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-10">
            Hangi markamızla ilgilendiğinizi seçin ve size en iyi şekilde yardımcı olalım.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/alb-tarim/iletisim"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              🌱 ALB Tarım İletişim
            </Link>
            <Link
              href="/alb-su-aritma/iletisim"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              💧 Alb Su İletişim
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
