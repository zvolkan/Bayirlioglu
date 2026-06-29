import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BRANDS } from '@/lib/constants'
import type { BrandKey } from '@/lib/types'

const VALID_BRANDS: BrandKey[] = ['alb-tarim', 'alb-su-aritma']

interface Props {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  if (!VALID_BRANDS.includes(brand as BrandKey)) return {}
  const cfg = BRANDS[brand as BrandKey]
  return {
    title: `Hizmetler | ${cfg.name}`,
    description: `${cfg.name} hizmetleri: teknik destek, danışmanlık ve daha fazlası.`,
  }
}

const TARIM_SERVICES = [
  {
    icon: '🌾',
    title: 'Tarım Danışmanlığı',
    desc: 'Uzman agronomlarımız tarladan sofraya tüm süreçte yanınızda. Toprak analizi, ürün seçimi ve gübreleme planlaması.',
    features: ['Toprak analizi', 'Ürün seçim danışmanlığı', 'Gübreleme planı', 'Hasat sonrası rehberlik'],
  },
  {
    icon: '🚜',
    title: 'Saha Ziyareti',
    desc: 'Uzmanlarımız tarlınıza gelir, yerinde inceleme yaparak en doğru çözümü sunar.',
    features: ['Ücretsiz saha analizi', 'Drone ile tarla görüntüleme', 'Verim haritalaması', 'Özel aksiyonm planı'],
  },
  {
    icon: '💧',
    title: 'Sulama Sistem Kurulumu',
    desc: 'Damla sulama ve yağmurlama sistemlerini profesyonel ekibimiz tasarlar ve kurar.',
    features: ['Tasarım ve hesaplama', 'Malzeme tedariki', 'Profesyonel montaj', 'Devreye alma ve eğitim'],
  },
  {
    icon: '📚',
    title: 'Çiftçi Eğitimi',
    desc: 'Modern tarım tekniklerini öğrenmek için düzenli seminerler ve online eğitimler.',
    features: ['Online seminerler', 'Yerinde uygulamalı eğitim', 'Sertifika programları', 'Teknik broşür ve rehberler'],
  },
  {
    icon: '🚚',
    title: 'Hızlı Teslimat',
    desc: '81 ile uzanan dağıtım ağımızla siparişleriniz 2-3 iş günü içinde kapınızda.',
    features: ['81 il teslimat', '2-3 iş günü', 'Soğuk zincir ürünler', 'Takip numarası ile anlık izleme'],
  },
  {
    icon: '🔧',
    title: 'Teknik Servis',
    desc: 'Sulama sistemleri ve tarım ekipmanlarınız için bakım ve onarım hizmeti.',
    features: ['Periyodik bakım', 'Arıza tespiti', 'Yedek parça temini', '24 saat destek hattı'],
  },
]

const ALBSU_SERVICES = [
  {
    icon: '🔬',
    title: 'Su Analizi',
    desc: 'Suyunuzun kalitesini ücretsiz analiz ediyoruz, ihtiyacınıza en uygun sistemi öneriyoruz.',
    features: ['Ücretsiz su kalite testi', 'Sertifikalı laboratuvar analizi', 'Sistem önerileri', 'Karşılaştırmalı rapor'],
  },
  {
    icon: '🛠️',
    title: 'Profesyonel Montaj',
    desc: 'Sertifikalı teknisyenlerimiz tüm kurulumu güvenle yapar, sisteminizi devreye alır.',
    features: ['Ücretsiz keşif', 'Sertifikalı montaj', 'Test ve devreye alma', 'Kullanım eğitimi'],
  },
  {
    icon: '🔄',
    title: 'Filtre Değişimi',
    desc: 'Düzenli filtre değişimi ve bakım programlarıyla sisteminizin verimliliğini koruyun.',
    features: ['Periyodik filtre değişimi', 'Sistem temizliği', 'Performans kontrolü', 'Hatırlatma servisi'],
  },
  {
    icon: '📞',
    title: '7/24 Teknik Destek',
    desc: 'Gece gündüz yanınızdayız. Arıza durumlarında en kısa sürede müdahale ediyoruz.',
    features: ['7/24 destek hattı', 'Uzaktan tanı', '4 saat müdahale garantisi', 'Online takip sistemi'],
  },
  {
    icon: '❄️',
    title: 'Klima Bakımı',
    desc: 'Sezon başı ve sezon sonu klima bakımıyla enerji verimliliğini artırın.',
    features: ['Gaz dolumu', 'Filtre temizliği', 'Performans testi', 'Garanti kapsamında bakım'],
  },
  {
    icon: '🏠',
    title: 'Akıllı Ev Çözümleri',
    desc: 'Evinizi akıllı sistemlerle donatın, enerji tasarrufu sağlayın ve konforlu yaşayın.',
    features: ['Akıllı termostat', 'Su kalite monitörü', 'Uzaktan kontrol', 'Enerji takip paneli'],
  },
]

export default async function HizmetlerPage({ params }: Props) {
  const { brand } = await params
  if (!VALID_BRANDS.includes(brand as BrandKey)) notFound()

  const brandKey = brand as BrandKey
  const isAlbSu = brandKey === 'alb-su-aritma'
  const cfg = BRANDS[brandKey]
  const services = isAlbSu ? ALBSU_SERVICES : TARIM_SERVICES

  const heroBg = isAlbSu ? 'from-blue-900 to-blue-950' : 'from-green-900 to-emerald-950'
  const accentText = isAlbSu ? 'text-blue-600' : 'text-green-600'
  const primaryBtn = isAlbSu ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
  const cardBorder = isAlbSu ? 'border-blue-100 hover:border-blue-200 hover:shadow-blue-50' : 'border-green-100 hover:border-green-200 hover:shadow-green-50'
  const tagText = isAlbSu ? 'text-blue-500' : 'text-green-500'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className={`bg-gradient-to-br ${heroBg} py-16`}>
        <div className="container-main text-center">
          <nav className="text-sm text-white/50 mb-6">
            <Link href={`/${brandKey}`} className="hover:text-white transition-colors">{cfg.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">Hizmetler</span>
          </nav>
          <p className={`font-bold uppercase text-sm tracking-widest mb-3 ${isAlbSu ? 'text-blue-400' : 'text-green-400'}`}>
            Hizmetlerimiz
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {cfg.name} Hizmetleri
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            {isAlbSu
              ? 'Kurulumdan bakıma, teknik destekten akıllı çözümlere kadar her aşamada yanınızdayız.'
              : 'Danışmanlıktan saha ziyaretine, eğitimden teknik servise kadar çiftçimizi destekliyoruz.'}
          </p>
        </div>
      </section>

      {/* Hizmetler Grid */}
      <section className="py-16 container-main">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.title}
              className={`bg-white rounded-2xl border ${cardBorder} p-7 hover:shadow-lg transition-all duration-200`}
            >
              <div className="text-4xl mb-5">{svc.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{svc.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{svc.desc}</p>
              <ul className="space-y-2">
                {svc.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isAlbSu ? 'bg-blue-500' : 'bg-green-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={`py-16 bg-gradient-to-br ${heroBg}`}>
        <div className="container-main text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
            Hizmet Almaya Hazır mısınız?
          </h2>
          <p className="text-white/60 mb-8">Uzman ekibimiz sizin için burada.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${brandKey}/iletisim`}
              className={`${primaryBtn} text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-lg`}
            >
              Hizmet Talebi Oluştur
            </Link>
            <a
              href={`https://wa.me/${cfg.whatsapp.phone}?text=${encodeURIComponent(cfg.whatsapp.message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1aad50] text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
