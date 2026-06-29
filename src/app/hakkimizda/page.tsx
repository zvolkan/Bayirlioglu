import type { Metadata } from 'next'
import Link from 'next/link'
import { BRAND } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'Şirket hikayemiz',
}

const stats = [
  { value: '20', label: 'Yıl Deneyim', suffix: '' },
  { value: '15.000', label: 'Mutlu Müşteri', suffix: '+' },
  { value: '81', label: 'İl', suffix: '' },
  { value: '500', label: 'Ürün', suffix: '+' },
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
      'Türkiye\'nin lider tarım ve su teknolojileri firması olarak sürdürülebilir, verimli ve çevre dostu çözümlerle sektörde referans marka olmak.',
    icon: '🌟',
  },
  {
    title: 'Değerlerimiz',
    description:
      'Müşteri memnuniyeti, dürüstlük, yenilikçilik ve sürdürülebilirlik ilkeleri tüm iş süreçlerimizin temelini oluşturmaktadır.',
    icon: '💎',
  },
]

const team = [
  {
    name: 'Ahmet Bayırlıoğlu',
    title: 'Genel Müdür',
    description: '20 yıllık sektör deneyimiyle şirketin kurucu ortağı ve vizyoner lideri.',
  },
  {
    name: 'Mehmet Yılmaz',
    title: 'Satış Müdürü',
    description: 'Bayi ağı ve kurumsal satış süreçlerini yöneten deneyimli satış profesyoneli.',
  },
  {
    name: 'Dr. Elif Kaya',
    title: 'Teknik Müdür',
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
      <section className={`${BRAND.colors.fallbackGradient} py-20 sm:py-24`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Hakkımızda</h1>
          <p className="text-xl sm:text-2xl text-white/85 font-medium">
            20 Yıllık Deneyim, Binlerce Mutlu Müşteri
          </p>
        </div>
      </section>

      {/* Şirket Hikayesi */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-3xl mx-auto prose prose-lg text-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Hikayemiz</h2>
            <p className="mb-4">
              Bayırlıoğlu ailesi, 2006 yılında Konya'nın tarım kalbi Çumra ilçesinde küçük bir tarım deposuyla bu yolculuğa başladı.
              Kurucu Ahmet Bayırlıoğlu'nun çiftçilere dürüst ve kaliteli ürün sunma vizyonu, kısa sürede bölge çiftçilerinin
              güvenini kazandı.
            </p>
            <p className="mb-4">
              2010 yılında Konya merkeze taşınan firma, gübre ve tohum ürünlerinin yanı sıra damla sulama sistemleri
              ile büyüyen ürün yelpazesini genişletti. 2015 yılında ise su arıtma ve iklimlendirme sektörüne adım atarak
              Albsu Teknolojileri markasını kurdu.
            </p>
            <p className="mb-4">
              Bugün, Türkiye'nin 81 ilinde 15.000'den fazla müşterimize hizmet vermekteyiz. 500'den fazla ürün ve uzman
              kadromuzla tarım ve su teknolojileri alanında güvenilir çözüm ortağınız olmaya devam ediyoruz.
            </p>
            <p>
              Her geçen yıl büyüyen bayi ağımız ve artan müşteri memnuniyeti oranlarımızla sektörde fark yaratmaya,
              çiftçimizin ve müşterimizin yanında durmaya devam ediyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* Misyon / Vizyon / Değerler */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Misyon, Vizyon & Değerler
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 text-center"
              >
                <div className="text-5xl mb-5">{item.icon}</div>
                <h3 className={`text-xl font-bold mb-3 ${BRAND.colors.primaryText}`}>
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className={`${BRAND.colors.fallbackGradient} py-16 sm:py-20`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center text-white">
                <div className="text-5xl sm:text-6xl font-bold mb-2">
                  {stat.value}
                  <span>{stat.suffix}</span>
                </div>
                <div className="text-white/75 text-lg font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ekip */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ekibimiz</h2>
            <p className="text-gray-600 text-lg">Deneyimli kadromuzla hizmetinizdeyiz</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center p-6"
              >
                {/* GÖRSEL: /public/images/team/ ekip fotoğrafları ekleyin */}
                <div className={`w-24 h-24 mx-auto rounded-full mb-4 flex items-center justify-center text-3xl ${BRAND.colors.primaryLight}`}>
                  👤
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className={`text-sm font-semibold mb-3 ${BRAND.colors.primaryText}`}>
                  {member.title}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sertifikalar */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Sertifikalarımız
            </h2>
            <p className="text-gray-600 text-lg">
              Kalite standartlarımızı belgeleyen uluslararası sertifikalarımız
            </p>
          </div>
          {/* GÖRSEL: /public/images/certificates/ sertifika görselleri ekleyin */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 text-center"
              >
                <div className={`w-16 h-16 mx-auto rounded-xl mb-4 flex items-center justify-center text-2xl ${BRAND.colors.primaryLight}`}>
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
      <section className={`${BRAND.colors.fallbackGradient} py-16 sm:py-20`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Bizimle Çalışmak İster misiniz?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Müşterimiz veya iş ortağımız olun, farkı birlikte yaşayalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/iletisim"
              className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200"
            >
              İletişime Geçin
            </Link>
            <Link
              href="/bayi-basvuru"
              className="inline-block border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-200"
            >
              Bayi Başvurusu
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
