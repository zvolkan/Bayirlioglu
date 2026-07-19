import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BRANDS } from '@/lib/constants'
import type { BrandKey } from '@/lib/types'

const VALID_BRANDS: BrandKey[] = ['alb-su-aritma']

interface Props {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  if (!VALID_BRANDS.includes(brand as BrandKey)) return {}
  const cfg = BRANDS[brand as BrandKey]
  return {
    title: `Referanslarımız | ${cfg.name}`,
    description: `${cfg.name} güvenilir referansları. Sanayi, sağlık, eğitim ve konut sektörlerinden 500+ memnun müşteri.`,
  }
}

// ─── Sektörler ────────────────────────────────────────────────────────────────
const SECTORS = [
  { icon: '🏭', label: 'Sanayi & Üretim', count: '150+', color: 'bg-blue-50 border-blue-100' },
  { icon: '🏥', label: 'Sağlık', count: '60+', color: 'bg-blue-50 border-blue-100' },
  { icon: '🎓', label: 'Eğitim', count: '45+', color: 'bg-blue-50 border-blue-100' },
  { icon: '🍽️', label: 'Gıda & Yiyecek', count: '80+', color: 'bg-blue-50 border-blue-100' },
  { icon: '🏢', label: 'Ofis & Plaza', count: '120+', color: 'bg-blue-50 border-blue-100' },
  { icon: '🏗️', label: 'Konut & Site', count: '200+', color: 'bg-blue-50 border-blue-100' },
  { icon: '🏦', label: 'Finans & Kamu', count: '35+', color: 'bg-blue-50 border-blue-100' },
  { icon: '🏨', label: 'Otel & Turizm', count: '40+', color: 'bg-blue-50 border-blue-100' },
]

// ─── Kurumsal Referanslar ─────────────────────────────────────────────────────
const CORPORATE_REFS = [
  {
    name: 'Anamur Belediyesi',
    sector: 'Kamu',
    icon: '🏛️',
    desc: 'İdare binaları ve sosyal tesisler için endüstriyel su arıtma sistemleri kurulumu.',
    year: '2022',
    system: 'Endüstriyel RO Sistemi',
  },
  {
    name: 'Mersin Üniversitesi',
    sector: 'Eğitim',
    icon: '🎓',
    desc: 'Yurt binaları ve kantin tesisleri için kapsamlı su arıtma altyapısı.',
    year: '2021',
    system: 'Çoklu Nokta RO Sistemi',
  },
  {
    name: 'Anamur Devlet Hastanesi',
    sector: 'Sağlık',
    icon: '🏥',
    desc: 'Tıbbi kullanım için yüksek safiyetli su üretimi; diyaliz bölümü özel sistemi.',
    year: '2023',
    system: 'Tıbbi Saf Su Ünitesi',
  },
  {
    name: 'Özgün Yapı Grubu',
    sector: 'Konut',
    icon: '🏗️',
    desc: '3 adet lüks konut sitesi için merkezi su yumuşatma ve arıtma sistemleri.',
    year: '2022',
    system: 'Merkezi Yumuşatma + RO',
  },
  {
    name: 'Anadolu Fırıncılık A.Ş.',
    sector: 'Gıda Üretimi',
    icon: '🏭',
    desc: 'Üretim hattı için sertlik giderme ve klor eliminasyon sistemleri.',
    year: '2023',
    system: 'Endüstriyel Yumuşatma',
  },
  {
    name: 'Türk Telekom Mersin Merkezi',
    sector: 'Ofis',
    icon: '📡',
    desc: 'Sunucu soğutma sistemleri için saf su üretimi ve periyodik bakım.',
    year: '2021',
    system: 'Deiyonize Su Sistemi',
  },
  {
    name: 'Mersin Marina AVM',
    sector: 'Ticari',
    icon: '🏬',
    desc: 'AVM restoranları ve gıda alanları için yüksek kapasiteli RO sistemi.',
    year: '2020',
    system: 'Yüksek Kapasiteli RO',
  },
  {
    name: 'Farmasi Mersin Deposu',
    sector: 'Lojistik & Üretim',
    icon: '📦',
    desc: 'Depo ve ofis alanları için merkezi içme suyu arıtma sistemi.',
    year: '2022',
    system: 'Alkali RO Sistemi',
  },
]

// ─── Müşteri Yorumları ────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Mehmet Kaya',
    title: 'Fabrika Müdürü',
    company: 'Kaya Tekstil A.Ş.',
    text: 'Endüstriyel RO sistemimizi 3 yıl önce Alb Su Teknolojileri\'nden aldık. Kazan hasarımız sıfıra indi, üretim kalitemiz belirgin şekilde arttı. Periyodik bakım ekibinin hızı ve özeni mükemmel.',
    rating: 5,
    avatar: 'MK',
  },
  {
    name: 'Elif Şahin',
    title: 'Ev Hanımı',
    company: 'Anamur / Mersin',
    text: 'Alkali su arıtma cihazımızı aleli eve koyduk. Çocuklarım artık sokaktan su almıyor, sağlıklı bir suya kavuştuk. Montaj ekibi çok titiz çalıştı, her şeyi açıkladılar.',
    rating: 5,
    avatar: 'EŞ',
  },
  {
    name: 'Ahmet Uzun',
    title: 'Restoran İşletmecisi',
    company: 'Uzun Kebap',
    text: 'Restoranımızda yemek kalitesi klorlu sudan dolayı etkileniyordu. Alb Su\'nun sistemi ile hem lezzet arttı hem de çaylarımız çok daha iyi oldu. Kesinlikle tavsiye ederim.',
    rating: 5,
    avatar: 'AU',
  },
  {
    name: 'Dr. Fatma Demir',
    title: 'Klinik Sahibi',
    company: 'Demir Diş Kliniği',
    text: 'Klinik için steril su talebi çok önemliydi. Alb Su\'nun tıbbi saf su sistemi tüm standartları karşılıyor, teknik destek ekibi her arızamda aynı gün müdahale etti.',
    rating: 5,
    avatar: 'FD',
  },
]

const STATS = [
  { value: '730+', label: 'Tamamlanan Kurulum' },
  { value: '8', label: 'Sektör' },
  { value: '%98', label: 'Müşteri Memnuniyeti' },
  { value: '5 Yıl', label: 'Ortalama İlişki Süresi' },
]

export default async function ReferanslarPage({ params }: Props) {
  const { brand } = await params
  if (!VALID_BRANDS.includes(brand as BrandKey)) notFound()

  const brandKey = brand as BrandKey
  const cfg = BRANDS[brandKey]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-950 py-20">
        <div className="container-main">
          <nav className="text-sm text-white/50 mb-8">
            <Link href={`/${brandKey}`} className="hover:text-white transition-colors">{cfg.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">Referanslarımız</span>
          </nav>
          <div className="max-w-2xl">
            <p className="font-bold uppercase text-sm tracking-widest mb-3 text-blue-400">
              Güven & Deneyim
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              Referanslarımız
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Sanayiden sağlığa, eğitimden konuta kadar 8 farklı sektörde 730'dan fazla başarılı
              kurulum. Her müşterimiz bizim için bir referans, her proje bir başarı hikayesi.
            </p>
          </div>
        </div>
      </section>

      {/* ── İSTATİSTİKLER ── */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="container-main">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-blue-600">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEKTÖRLER ── */}
      <section className="py-16 bg-gray-50">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="font-bold uppercase text-sm tracking-widest mb-2 text-blue-600">Sektörler</p>
            <h2 className="text-3xl font-black text-gray-900">Hizmet Verdiğimiz Alanlar</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SECTORS.map((s) => (
              <div
                key={s.label}
                className={`bg-white rounded-2xl border ${s.color} p-5 text-center hover:shadow-md transition-shadow`}
              >
                <div className="text-3xl mb-3">{s.icon}</div>
                <p className="font-bold text-gray-900 text-sm mb-1">{s.label}</p>
                <p className="text-blue-600 text-lg font-black">{s.count}</p>
                <p className="text-gray-400 text-xs">referans</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KURUMSAL REFERANSLAR ── */}
      <section className="py-16 bg-white">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="font-bold uppercase text-sm tracking-widest mb-2 text-blue-600">Kurumsal</p>
            <h2 className="text-3xl font-black text-gray-900">Kurumsal Müşterilerimiz</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Kamu kuruluşlarından özel sektöre, küçük işletmelerden büyük tesislere kadar
              her ölçekte çözüm üretiyoruz.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORPORATE_REFS.map((ref) => (
              <div
                key={ref.name}
                className="bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-6"
              >
                {/* Logo placeholder */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-2xl mb-4">
                  {ref.icon}
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{ref.name}</h3>
                </div>
                <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-3">
                  {ref.sector}
                </span>
                <p className="text-gray-600 text-xs leading-relaxed mb-4">{ref.desc}</p>
                <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">{ref.system}</span>
                  <span className="text-[10px] text-gray-400">{ref.year}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            ve 700'den fazla bireysel & kurumsal referansımız daha…
          </p>
        </div>
      </section>

      {/* ── MÜŞTERİ YORUMLARI ── */}
      <section className="py-16 bg-gray-50">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="font-bold uppercase text-sm tracking-widest mb-2 text-blue-600">Yorumlar</p>
            <h2 className="text-3xl font-black text-gray-900">Müşterilerimiz Ne Diyor?</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                {/* Yıldızlar */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-xs">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.title} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-950 py-16">
        <div className="container-main text-center text-white">
          <h2 className="text-3xl font-black mb-4">Siz de Referanslarımız Arasına Katılın</h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Ücretsiz su analizi ve kurulum keşfi için hemen iletişime geçin. Size özel çözüm sunalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${brandKey}/iletisim`}
              className="bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold text-base hover:bg-blue-50 transition-colors"
            >
              Ücretsiz Keşif Talep Et
            </Link>
            <Link
              href={`/${brandKey}/urunler`}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/10 transition-colors"
            >
              Ürünlerimizi İncele
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
