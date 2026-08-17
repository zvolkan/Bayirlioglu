/**
 * Hizmet listeleri.
 *
 * Ürünler, kategoriler, yorumlar ve blog yazıları veritabanına taşındı.
 * Geriye yalnızca hizmet tanıtım listeleri kaldı; bunlar nadiren değişen
 * pazarlama metinleri olduğu için kodda duruyor.
 */
import type { Service } from '@/lib/types';
import type { IconName } from '@/components/ui/Icon';
import { SITE_CONFIG } from '@/lib/constants';

type ServiceWithIcon = Omit<Service, 'icon'> & { icon: IconName };


export const MOCK_SERVICES_TARIM: ServiceWithIcon[] = [
  {
    id: 1,
    title: 'Toprak Analizi',
    description: 'Laboratuvar ortamında kapsamlı toprak analizi yaparak ihtiyacınıza özel gübreleme planı hazırlıyoruz.',
    icon: 'analiz',
    features: ['NPK analizi', 'pH ölçümü', 'Mikro besin tespiti', 'Kişiselleştirilmiş rapor'],
    brand: 'alb-tarim',
    price: 'Ücretsiz danışmanlık',
  },
  {
    id: 2,
    title: 'Zirai Danışmanlık',
    description: 'Toprak ve yaprak analizine dayalı gübreleme ile bitki koruma programı.',
    icon: 'servis',
    features: ['Arazi etüdü', 'Sistem tasarımı', 'Montaj & test', '1 yıl bakım garantisi'],
    brand: 'alb-tarim',
    price: 'Fiyat için arayın',
  },
  {
    id: 3,
    title: 'Tarımsal Danışmanlık',
    description: 'Ziraat mühendislerimiz arazi ziyareti yaparak verimliliğinizi artıracak çözümler önerir.',
    icon: 'filiz',
    features: ['Arazi ziyareti', 'Ürün planlaması', 'Hastalık-zararlı takibi', 'WhatsApp destek'],
    brand: 'alb-tarim',
    price: 'Aylık plan',
  },
];

export const MOCK_SERVICES_ALBSU: ServiceWithIcon[] = [
  {
    id: 10,
    title: 'Ücretsiz Montaj',
    description: 'Satın aldığınız su arıtma, sebil, boiler veya klima cihazını uzman ekibimiz montaj güvencesiyle kuruyor.',
    icon: 'servis',
    features: ['Ücretsiz montaj', 'Su / sistem testi', 'Kullanım eğitimi', '2 yıl garanti'],
    brand: 'alb-su-aritma',
    price: 'Ücretsiz',
  },
  {
    id: 11,
    title: 'Periyodik Bakım',
    description: 'Klima, boiler ve su arıtma cihazlarınız için yıllık bakım ve filtre değişim hizmeti.',
    icon: 'servis',
    features: ['Filtre / reçine değişimi', 'Gaz ve sistem kontrolü', 'Teknik rapor', 'Öncelikli servis'],
    brand: 'alb-su-aritma',
    price: 'Yıllık sözleşme',
  },
  {
    id: 12,
    title: 'Teknik Destek',
    description: 'Arıza durumunda telefonla uzaktan yardım, gerektiğinde yerinde teknisyen desteği.',
    icon: 'telefon',
    features: [`Destek hattı: ${SITE_CONFIG.workingHours}`, 'Uzaktan destek', 'Orijinal yedek parça', 'Garanti kapsamı'],
    brand: 'alb-su-aritma',
    price: 'Garanti dahilinde',
  },
];
