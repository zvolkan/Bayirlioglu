/**
 * Blog yazıları ve hizmet listeleri.
 *
 * Ürünler, kategoriler ve yorumlar artık veritabanından geliyor; bu dosyada
 * kalan iki liste henüz veritabanına taşınmadığı için burada duruyor.
 * Blog içerikleri gerçek metinle doldurulunca burası da boşalacak.
 */
import type { BlogPost, Service } from '@/lib/types';


export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: 'Buğday Sezonunda Doğru Gübreleme Rehberi 2026',
    slug: 'bugday-sezonunda-dogru-gubreleme-2026',
    excerpt: 'Buğday ekiminde verim kaybını önlemek için uygulanması gereken gübre miktarları, zamanlaması ve uygulama teknikleri.',
    content: '<!-- Makale içeriği sonradan eklenecek -->',
    coverImage: '/images/blog/blog-001.jpg',
    author: 'Ziraat Müh. Ahmet Yıldız',
    publishedAt: '2026-06-15T08:00:00Z',
    brand: 'alb-tarim',
    tags: ['gübre', 'buğday', 'verim'],
    readTime: 6,
  },
  {
    id: 2,
    title: 'Damla Sulama ile %50 Su Tasarrufu Nasıl Sağlanır?',
    slug: 'damla-sulama-su-tasarrufu',
    excerpt: 'Modern damla sulama sistemleri, geleneksel yöntemlere kıyasla yarı yarıya su tasarrufu sağlarken verimi artırıyor.',
    content: '<!-- Makale içeriği sonradan eklenecek -->',
    coverImage: '/images/blog/blog-002.jpg',
    author: 'Mehmet Kaya',
    publishedAt: '2026-05-28T08:00:00Z',
    brand: 'alb-tarim',
    tags: ['sulama', 'su tasarrufu', 'damla'],
    readTime: 4,
  },
  {
    id: 3,
    title: 'Ev Su Arıtma Cihazı Seçerken Dikkat Edilmesi Gerekenler',
    slug: 'ev-su-aritma-cihazi-secimi',
    excerpt: 'Piyasadaki farklı su arıtma teknolojilerini karşılaştırıyor, doğru cihazı nasıl seçeceğinizi açıklıyoruz.',
    content: '<!-- Makale içeriği sonradan eklenecek -->',
    coverImage: '/images/blog/blog-003.jpg',
    author: 'Su Teknolojileri Uzmanı',
    publishedAt: '2026-06-10T08:00:00Z',
    brand: 'alb-su-aritma',
    tags: ['su arıtma', 'rehber', 'RO'],
    readTime: 5,
  },
];

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
