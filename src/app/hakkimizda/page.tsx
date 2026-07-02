import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Hakkımızda | Bayırlıoğlu Grup',
  description:
    '2006 yılından bu yana tarım ve su teknolojileri alanında faaliyet gösteren Bayırlıoğlu Grup hakkında bilgi edinin.',
}

const stats = [
  { value: '20+', label: 'Yıl Deneyim' },
  { value: '15.000+', label: 'Mutlu Müşteri' },
  { value: '81', label: 'İl' },
  { value: '500+', label: 'Ürün Çeşidi' },
]

const values = [
  {
    title: 'Misyonumuz',
    description:
      'Çiftçilerimize ve bireysel müşterilerimize yüksek kaliteli ürünler ve profesyonel hizmetlerle modern tarım ile su teknolojilerini en erişilebilir şekilde sunmak.',
    icon: '🎯',
  },
  {
    title: 'Vizyonumuz',
    description:
      "Türkiye'nin lider tarım ve su teknolojileri holding'i olarak sürdürülebilir, verimli ve çevre dostu çözümlerle sektörde referans grup olmak.",
    icon: '🌟',
  },
  {
    title: 'Değerlerimiz',
    description:
      'Müşteri memnuniyeti, dürüstlük, yenilikçilik ve sürdürülebilirlik ilkeleri tüm iş süreçlerimizin temelini oluşturmaktadır.',
    icon: '💎',
  },
]

const markalar = [
  {
    name: 'ALB Tarım',
    color: 'bg-green-600',
    textColor: 'text-green-700',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-200',
    href: '/alb-tarim',
    desc: 'Organik gübreler, sulama sistemleri, tarım ilaçları ve ekipmanları alanında faaliyet göstermektedir. Çiftçilerimize uygun fiyat, hızlı teslimat ve uzman tarım danışmanlığı sunmaktadır.',
    kuruluş: '2006',
    icon: '🌾',
  },
  {
    name: 'Alb Su Teknolojileri',
    color: 'bg-blue-600',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    href: '/alb-su-aritma',
    desc: 'Su arıtma sistemleri, klima ve iklimlendirme çözümleri alanında faaliyet göstermektedir. Profesyonel montaj, filtre değişimi ve 7/24 teknik servis hizmeti sunmaktadır.',
    kuruluş: '2015',
    icon: '💧',
  },
]

const team = [
  {
    name: 'Ahmet Bayırlıoğlu',
    title: 'Yönetim Kurulu Başkanı',
    description: '20 yıllık sektör deneyimiyle grubun kurucu ortağı ve vizyoner lideri.',
  },
  {
    name: 'Mehmet Yılmaz',
    title: 'Satış Direktörü',
    description: 'Bayi ağı ve kurumsal satış süreçlerini yöneten deneyimli satış profesyoneli.',
  },
  {
    name: 'Dr. Elif Kaya',
    title: 'Teknik Direktör',
    description: 'Ziraat mühendisi ve su teknolojileri uzmanı, Ar-Ge süreçlerinin sorumlusu.',
  },
  {
    name: 'Fatma Demir',
    title: 'Müşteri Hizmetleri Müdürü',
    description: 'Müşteri deneyimini en üst düzeye çıkarmak için çalışan ekibimizin lideri.',
  },
]

const certifications = [
  { name: 'ISO 9001:2015', description: 'Kalite Yönetim Sistemi' },
  { name: 'ISO 14001:2015', description: 'Çevre Yönetim Sistemi' },
  { name: 'CE Belgesi', description: 'Avrupa Uygunluk Standardı' },
  { name: 'TSE Belgesi', description: 'Türk Standartları Enstitüsü' },
]

export default function HakkimizdaPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center text-white">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Bayırlıoğlu Grup
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Hakkımızda</h1>
          <p className="text-xl text-white/75 font-medium max-w-xl mx-auto">
            2006'dan Bu Yana Tarım ve Su Teknolojilerinde Güvenilir Çözüm Ortağınız
          </p>
        </div>
      </section>

      {/* Şirket Hikayesi */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Hikayemiz</h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                Bayırlıoğlu ailesi, 2006 yılında Konya'nın tarım kalbi Çumra ilçesinde küçük bir
                tarım deposuyla bu yolculuğa başladı. Kurucu Ahmet Bayırlıoğlu'nun çiftçilere
                dürüst ve kaliteli ürün sunma vizyonu, kısa sürede bölge çiftçilerinin güvenini
                kazandı.
              </p>
              <p>
                2010 yılında Konya merkeze taşınan firma, gübre ve tohum ürünlerinin yanı sıra
                damla sulama sistemleriyle büyüyen ürün yelpazesini genişletti. 2015 yılında ise
                su arıtma ve iklimlendirme sektörüne adım atarak{' '}
                <strong>Alb Su Teknolojileri</strong> markasını kurdu.
              </p>
              <p>
                Bugün, Türkiye'nin 81 ilinde 15.000'den fazla müşterimize hizmet vermekteyiz.
                500'den fazla ürün ve uzman kadromuzla tarım ve su teknolojileri alanında
                güvenilir çözüm ortağınız olmaya devam ediyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Markalar */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-widest mb-2">
              Bünyemizde
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Markalarımız</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {markalar.map((m) => (
              <div
                key={m.name}
                className={`bg-white rounded-2xl border ${m.borderColor} shadow-sm hover:shadow-md transition-shadow p-8`}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className={`${m.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}>
                    {m.icon}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${m.textColor}`}>{m.name}</h3>
                    <p className="text-gray-400 text-xs">Kuruluş: {m.kuruluş}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">{m.desc}</p>
                <Link
                  href={m.href}
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${m.textColor} hover:underline`}
                >
                  Markaya Git →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Misyon / Vizyon / Değerler */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Misyon, Vizyon & Değerler
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 text-center"
              >
                <div className="text-5xl mb-5">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/60 text-lg font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ekip */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ekibimiz</h2>
            <p className="text-gray-500 text-lg">Deneyimli kadromuzla hizmetinizdeyiz</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center p-6"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 mb-4 flex items-center justify-center text-2xl">
                  👤
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm font-semibold text-gray-500 mb-3">{member.title}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sertifikalar */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Sertifikalarımız</h2>
            <p className="text-gray-500 text-lg">
              Kalite standartlarımızı belgeleyen uluslararası sertifikalarımız
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-gray-100 mb-4 flex items-center justify-center text-2xl">
                  🏅
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{cert.name}</h3>
                <p className="text-gray-500 text-sm">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Bizimle Çalışmak İster misiniz?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Müşterimiz veya iş ortağımız olun, farkı birlikte yaşayalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/iletisim"
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              İletişime Geçin
            </Link>
            <Link
              href="/bayi-basvuru"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Bayi Başvurusu
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
