import { BRAND, ACTIVE_BRAND_KEY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Reveal from '@/components/ui/Reveal';
import RevealGroup from '@/components/ui/RevealGroup';

const BASE_FEATURES = [
  {
    icon: '🚚',
    title: 'Hızlı Teslimat',
    desc: 'Siparişleriniz 24-48 saat içinde kargolanır.',
  },
  {
    icon: '🔧',
    title: 'Ücretsiz Kurulum',
    desc: 'Satın aldığınız ürünleri uzman ekibimiz kurar.',
  },
  {
    icon: '📞',
    title: '7/24 Destek',
    desc: 'Teknik destek hattımız her an yanınızda.',
  },
  {
    icon: '✅',
    title: 'Orijinal Ürün',
    desc: 'Tüm ürünlerimiz garantili ve orijinaldir.',
  },
];

const TARIM_EXTRA = {
  icon: '👩‍🌾',
  title: 'Tarım Danışmanlığı',
  desc: 'Ziraat mühendislerimiz arazi ziyareti yapar.',
};

const features =
  ACTIVE_BRAND_KEY === 'alb-tarim'
    ? [...BASE_FEATURES, TARIM_EXTRA]
    : BASE_FEATURES;

export default function WhyUs() {
  const isTarim = ACTIVE_BRAND_KEY === 'alb-tarim';

  return (
    <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Başlık */}
        <Reveal className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Neden Bizi Tercih Etmelisiniz?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {ACTIVE_BRAND_KEY === 'alb-tarim'
              ? 'Çiftçilerimize en iyi hizmeti sunmak için buradayız.'
              : 'Müşterilerimize kaliteli ürün ve kesintisiz destek sunuyoruz.'}
          </p>
        </Reveal>

        {/* Kart Grid */}
        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 gap-6',
            isTarim ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
          )}
        >
          <RevealGroup stagger={80} itemClassName="h-full">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group h-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start gap-4"
              >
                {/* İkon dairesi */}
                <div
                  className={cn(
                    'icon-pop w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0',
                    BRAND.colors.primaryLight
                  )}
                >
                  {feature.icon}
                </div>

                {/* İçerik */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
