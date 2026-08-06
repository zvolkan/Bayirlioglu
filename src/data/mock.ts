/**
 * Hizmet listeleri.
 *
 * Ürünler, kategoriler, yorumlar ve blog yazıları veritabanına taşındı.
 * Geriye yalnızca hizmet tanıtım listeleri kaldı; bunlar nadiren değişen
 * pazarlama metinleri olduğu için kodda duruyor.
 */
import type { Service } from '@/lib/types';


export const MOCK_SERVICES_TARIM: Service[] = [
  {
    id: 1,
    title: 'Toprak Analizi',
    description: 'Laboratuvar ortamında kapsamlı toprak analizi yaparak ihtiyacınıza özel gübreleme planı hazırlıyoruz.',
    icon: '🔬',
    features: ['NPK analizi', 'pH ölçümü', 'Mikro besin tespiti', 'Kişiselleştirilmiş rapor'],
    brand: 'alb-tarim',
    price: 'Ücretsiz danışmanlık',
  },
  {
    id: 2,
    title: 'Sulama Sistemi Kurulumu',
    description: 'Arazinize özel damla sulama veya yağmurlama sistemi tasarımı ve kurulumu.',
    icon: '🔧',
    features: ['Arazi etüdü', 'Sistem tasarımı', 'Montaj & test', '1 yıl bakım garantisi'],
    brand: 'alb-tarim',
    price: 'Fiyat için arayın',
  },
  {
    id: 3,
    title: 'Tarımsal Danışmanlık',
    description: 'Ziraat mühendislerimiz arazi ziyareti yaparak verimliliğinizi artıracak çözümler önerir.',
    icon: '👩‍🌾',
    features: ['Haftada 1 arazi ziyareti', 'Ürün planlaması', 'Hastalık-zararlı takibi', 'WhatsApp destek'],
    brand: 'alb-tarim',
    price: 'Aylık plan',
  },
];

export const MOCK_SERVICES_ALBSU: Service[] = [
  {
    id: 10,
    title: 'Ücretsiz Montaj',
    description: 'Satın aldığınız su arıtma, sebil, boiler veya klima cihazını uzman ekibimiz montaj güvencesiyle kuruyor.',
    icon: '🔩',
    features: ['Ücretsiz montaj', 'Su / sistem testi', 'Kullanım eğitimi', '2 yıl garanti'],
    brand: 'alb-su-aritma',
    price: 'Ücretsiz',
  },
  {
    id: 11,
    title: 'Periyodik Bakım',
    description: 'Klima, boiler ve su arıtma cihazlarınız için yıllık bakım ve filtre değişim hizmeti.',
    icon: '🛠️',
    features: ['Filtre / reçine değişimi', 'Gaz ve sistem kontrolü', 'Teknik rapor', 'Öncelikli servis'],
    brand: 'alb-su-aritma',
    price: 'Yıllık sözleşme',
  },
  {
    id: 12,
    title: '7/24 Teknik Destek',
    description: 'Arıza durumunda 4 saat içinde teknisyen desteği ve uzaktan teknik yardım.',
    icon: '📞',
    features: ['4 saat içinde müdahale', 'Uzaktan destek', 'Orijinal yedek parça', 'Garanti kapsamı'],
    brand: 'alb-su-aritma',
    price: 'Garanti dahilinde',
  },
];
