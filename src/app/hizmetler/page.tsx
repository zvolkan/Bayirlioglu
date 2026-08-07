import type { Metadata } from 'next'
import Link from 'next/link'
import { MOCK_SERVICES_TARIM, MOCK_SERVICES_ALBSU } from '@/data/mock'

export const metadata: Metadata = {
  title: 'Hizmetler | Bayırlıoğlu',
  description: 'ALB Tarım ve Alb Su Teknolojileri markalarımızın sunduğu profesyonel hizmetler.',
}

const processSteps = [
  {
    step: '1',
    title: 'Bize Ulaşın',
    description: 'Telefon, WhatsApp veya iletişim formu aracılığıyla bizimle iletişime geçin.',
    icon: '📞',
  },
  {
    step: '2',
    title: 'Keşif & Planlama',
    description: 'Uzman ekibimiz ihtiyaçlarınızı analiz ederek size özel bir çözüm planı hazırlar.',
    icon: '📋',
  },
  {
    step: '3',
    title: 'Uygulama',
    description: 'Deneyimli teknik ekibimiz belirlenen plan doğrultusunda uygulamayı gerçekleştirir.',
    icon: '⚙️',
  },
  {
    step: '4',
    title: 'Teslim & Destek',
    description: 'Tamamlanan hizmet teslim edilir, sürekli destek ve garanti hizmetimiz başlar.',
    icon: '✅',
  },
]

const faqItems = [
  {
    question: 'Hizmet bölgeniz neresidir?',
    answer: 'Türkiye genelinde 81 ilde hizmet vermekteyiz. Büyük şehirlerde yerinde teknik destek, diğer illerde uzaktan danışmanlık ve kargo ile çözüm sunuyoruz.',
  },
  {
    question: 'Garanti süresi ne kadardır?',
    answer: 'Kurulum ve montaj hizmetlerimizde minimum 1 yıl işçilik garantisi sunuyoruz. Ürün garantileri marka ve modele göre 2-5 yıl arasında değişmektedir.',
  },
  {
    question: 'Randevu ne kadar sürede alınabilir?',
    answer: 'Genellikle 24-48 saat içinde randevu planlanmaktadır. Acil durumlar için öncelikli hizmet seçeneğimiz mevcuttur.',
  },
  {
    question: 'Fiyat teklifi nasıl alıyorum?',
    answer: 'Telefon veya iletişim formu aracılığıyla bize ulaşmanız yeterlidir. Uzmanlarımız ihtiyaçlarınızı değerlendirerek ücretsiz fiyat teklifi sunar.',
  },
  {
    question: 'Teknik destek için ne yapmalıyım?',
    answer: 'Çalışma saatlerimizde telefon hattımızı, mesai dışı saatlerde ise WhatsApp hattımızı kullanabilirsiniz. 7/24 hizmet kapsamındaki sözleşmeli müşterilerimiz her zaman öncelikli destek alır.',
  },
]

export default function HizmetlerPage() {
  return (
    <main>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center text-white">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Bayırlıoğlu
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Hizmetlerimiz</h1>
          <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto">
            Uzman kadromuz ve yılların deneyimiyle size en iyi hizmeti sunmak için buradayız.
          </p>
        </div>
      </section>

      {/* ALB Tarım Hizmetleri */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-green-600 w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              🌾
            </div>
            <div>
              <p className="text-green-700 text-xs font-semibold uppercase tracking-widest">Marka</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">ALB Tarım Hizmetleri</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_SERVICES_TARIM.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col border border-green-100"
              >
                <div className="text-5xl mb-5">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-5 flex-grow">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                      <span className="text-green-500 font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {service.price && (
                  <div className="inline-block px-4 py-2 rounded-xl text-sm font-semibold mb-5 bg-green-50 border border-green-200 text-green-700">
                    {service.price}
                  </div>
                )}
                <Link
                  href="/iletisim"
                  className="block text-center py-3 rounded-xl font-semibold transition-all duration-200 bg-green-600 hover:bg-green-500 text-white"
                >
                  Detaylı Bilgi
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alb Su Teknolojileri Hizmetleri */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              💧
            </div>
            <div>
              <p className="text-blue-700 text-xs font-semibold uppercase tracking-widest">Marka</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Alb Su Teknolojileri Hizmetleri</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_SERVICES_ALBSU.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col border border-blue-100"
              >
                <div className="text-5xl mb-5">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-5 flex-grow">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                      <span className="text-blue-500 font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {service.price && (
                  <div className="inline-block px-4 py-2 rounded-xl text-sm font-semibold mb-5 bg-blue-50 border border-blue-200 text-blue-700">
                    {service.price}
                  </div>
                )}
                <Link
                  href="/iletisim"
                  className="block text-center py-3 rounded-xl font-semibold transition-all duration-200 bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Detaylı Bilgi
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Süreç Adımları */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Nasıl Çalışıyoruz?</h2>
            <p className="text-gray-600 text-lg">4 kolay adımda hizmetinize ulaşın</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((item, idx) => (
              <div key={item.step} className="relative text-center">
                {idx < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gray-200 z-0" />
                )}
                <div className="relative z-10 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-4 bg-gray-100">
                  {item.icon}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                  Adım {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Sık Sorulan Sorular</h2>
            <p className="text-gray-600 text-lg">Merak ettiğiniz her şeyin cevabı burada</p>
          </div>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <details key={idx} className="bg-gray-50 rounded-2xl group">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-gray-900 list-none">
                  {item.question}
                  <span className="ml-4 text-gray-400 group-open:rotate-180 transition-transform duration-200 flex-shrink-0">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Hemen Randevu Alın</h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Uzman ekibimiz en kısa sürede size ulaşsın. Ücretsiz keşif ve danışmanlık için hemen arayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <span
              className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg select-none"
            >
              📞 +90 544 414 22 54
            </span>
            <Link
              href="/iletisim"
              className="inline-block border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-200"
            >
              İletişim Formu
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
