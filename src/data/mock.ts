/**
 * mock.ts — Geliştirme süreci için örnek veriler
 * Gerçek API / veritabanı bağlantısı kurulduğunda bu dosya kaldırılacak.
 */
import type {
  Product, Category, BlogPost, Testimonial, Service,
} from '@/lib/types';

// ─── KATEGORİLER ─────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES_TARIM: Category[] = [
  {
    id: 1, name: 'Gübreler', slug: 'gubreler',
    icon: '🌿', brand: 'alb-tarim', sortOrder: 1, productCount: 48,
    description: 'Toprak ve yaprak gübreleri, organik çözümler',
    // GÖRSEL: /public/images/categories/gubreler.jpg
    image: '/images/categories/gubreler.jpg',
  },
  {
    id: 2, name: 'Sulama Sistemleri', slug: 'sulama',
    icon: '💧', brand: 'alb-tarim', sortOrder: 2, productCount: 32,
    description: 'Damla sulama, sprinkler ve akıllı sulama çözümleri',
    image: '/images/categories/sulama.jpg',
  },
  {
    id: 3, name: 'Tarım İlaçları', slug: 'ilac',
    icon: '🧪', brand: 'alb-tarim', sortOrder: 3, productCount: 67,
    description: 'Herbisitler, fungisitler, insektisitler',
    image: '/images/categories/ilac.jpg',
  },
  {
    id: 4, name: 'Tarım Teknolojileri', slug: 'teknoloji',
    icon: '🚁', brand: 'alb-tarim', sortOrder: 4, productCount: 15,
    description: 'Drone sistemleri, sensörler, akıllı tarım ekipmanları',
    image: '/images/categories/teknoloji.jpg',
  },
  {
    id: 5, name: 'Tohum & Fide', slug: 'tohum',
    icon: '🌱', brand: 'alb-tarim', sortOrder: 5, productCount: 89,
    description: 'Sertifikalı tohum ve fide çeşitleri',
    image: '/images/categories/tohum.jpg',
  },
  {
    id: 6, name: 'Toprak İyileştirici', slug: 'toprak',
    icon: '🪨', brand: 'alb-tarim', sortOrder: 6, productCount: 24,
    description: 'pH düzenleyici, humik asit ve toprak kondisyonerleri',
    image: '/images/categories/toprak.jpg',
  },
];

export const MOCK_CATEGORIES_ALBSU: Category[] = [
  {
    id: 10, name: 'Su Arıtma Sistemleri', slug: 'su-aritma',
    icon: '🚿', brand: 'alb-su-aritma', sortOrder: 1, productCount: 35,
    description: 'Ev tipi ve endüstriyel su arıtma cihazları',
    image: '/images/categories/su-aritma.jpg',
  },
  {
    id: 11, name: 'Klima Sistemleri', slug: 'klima',
    icon: '❄️', brand: 'alb-su-aritma', sortOrder: 2, productCount: 28,
    description: 'Duvar tipi, kaset tipi ve VRF klima sistemleri',
    image: '/images/categories/klima.jpg',
  },
  {
    id: 12, name: 'Ev Elektroniği', slug: 'elektronik',
    icon: '📱', brand: 'alb-su-aritma', sortOrder: 3, productCount: 52,
    description: 'Akıllı ev cihazları ve elektronik ev aletleri',
    image: '/images/categories/elektronik.jpg',
  },
  {
    id: 13, name: 'Yedek Parça & Filtre', slug: 'yedek-parca',
    icon: '🔧', brand: 'alb-su-aritma', sortOrder: 4, productCount: 120,
    description: 'Su arıtma filtresi, UV lamba ve orijinal yedek parçalar',
    image: '/images/categories/yedek-parca.jpg',
  },
];

// ─── ÜRÜNLER ─────────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prd-001',
    name: 'ProGreen Azotlu Gübre 25kg',
    slug: 'progreen-azotlu-gubre-25kg',
    shortDescription: 'Yüksek verimlilik için dengeli azot formülü, tüm toprak tipleriyle uyumlu.',
    description:
      'ProGreen Azotlu Gübre, bitki gelişiminin her aşamasında etkili olan özel formülüyle verimliliği %30\'a kadar artırır. Yavaş salınımlı azot içeriği sayesinde uzun süreli etki gösterir ve toprak yapısını iyileştirir.',
    price: 485,
    salePrice: 420,
    brand: 'alb-tarim',
    category: MOCK_CATEGORIES_TARIM[0],
    sku: 'PG-AZT-25',
    unit: 'çuval',
    stock: 248,
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 127,
    tags: ['azot', 'gübre', 'organik'],
    // GÖRSELLER: /public/images/products/prd-001-*.jpg dosyalarını ekleyin
    images: [
      { url: '/images/products/prd-001-1.jpg', alt: 'ProGreen Azotlu Gübre', isPrimary: true },
      { url: '/images/products/prd-001-2.jpg', alt: 'ProGreen Gübre Uygulama', isPrimary: false },
    ],
    specs: [
      { name: 'Net Ağırlık', value: '25', unit: 'kg' },
      { name: 'Azot (N) İçeriği', value: '%46' },
      { name: 'Granül Boyutu', value: '2-4', unit: 'mm' },
      { name: 'Uygulama Dönemi', value: 'İlkbahar – Yaz' },
      { name: 'Tavsiye Doz', value: '20-30', unit: 'kg/da' },
    ],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'prd-002',
    name: 'AquaDrop Damla Sulama Seti 1 Dönüm',
    slug: 'aquadrop-damla-sulama-seti-1-donum',
    shortDescription: '1 dönüm alan için eksiksiz damla sulama sistemi, kurulum dahil.',
    description:
      'AquaDrop damla sulama seti, su kullanımını %50 azaltırken bitki başına su verimliliğini maksimize eder. Komple kurulum seti, filtre, vana ve damlatıcıları içerir.',
    price: 1250,
    brand: 'alb-tarim',
    category: MOCK_CATEGORIES_TARIM[1],
    sku: 'AD-SS-1D',
    unit: 'set',
    stock: 45,
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 89,
    tags: ['sulama', 'damla', 'su tasarrufu'],
    images: [
      { url: '/images/products/prd-002-1.jpg', alt: 'Damla Sulama Seti', isPrimary: true },
    ],
    specs: [
      { name: 'Kapsama Alanı', value: '1', unit: 'dönüm' },
      { name: 'Boru Çapı', value: '16', unit: 'mm' },
      { name: 'Damlatıcı Aralığı', value: '30', unit: 'cm' },
      { name: 'Çalışma Basıncı', value: '0.5-4', unit: 'bar' },
      { name: 'Malzeme', value: 'UV dayanımlı PE' },
    ],
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-05-20T08:00:00Z',
  },
  {
    id: 'prd-003',
    name: 'BioSol Organik Sıvı Gübre 20L',
    slug: 'biosol-organik-sivi-gubre-20l',
    shortDescription: 'Sertifikalı organik üretim için biyolojik sıvı gübre.',
    description:
      'BioSol, bitkisel ve hayvansal kökenli hammaddelerden üretilen, organik tarım sertifikasına sahip sıvı gübredir. Toprak mikrobiyal aktivitesini artırır.',
    price: 320,
    salePrice: 285,
    brand: 'alb-tarim',
    category: MOCK_CATEGORIES_TARIM[0],
    sku: 'BS-ORG-20L',
    unit: 'bidon',
    stock: 6,
    isFeatured: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 54,
    tags: ['organik', 'sıvı gübre', 'biyolojik'],
    images: [
      { url: '/images/products/prd-003-1.jpg', alt: 'BioSol Organik Gübre', isPrimary: true },
    ],
    specs: [
      { name: 'Hacim', value: '20', unit: 'litre' },
      { name: 'Organik Madde', value: '%8' },
      { name: 'pH', value: '6.5-7.5' },
      { name: 'Uygulama', value: 'Damla sulama / yapraktan' },
    ],
    createdAt: '2026-03-05T10:00:00Z',
    updatedAt: '2026-06-10T08:00:00Z',
  },
  {
    id: 'prd-004',
    name: 'PureFlow RO 6 Aşamalı Su Arıtma',
    slug: 'pureflow-ro-6-asamali-su-aritma',
    shortDescription: '6 aşamalı RO filtreli, günlük 190 litre kapasiteli ev tipi su arıtma.',
    description:
      'PureFlow RO, ters osmoz teknolojisiyle %99.9 bakteri ve ağır metal giderim kapasitesi sunar. Akıllı TDS monitörü sayesinde su kalitesini anlık takip edebilirsiniz.',
    price: 2890,
    salePrice: 2490,
    brand: 'alb-su-aritma',
    category: MOCK_CATEGORIES_ALBSU[0],
    sku: 'PF-RO-6A',
    unit: 'adet',
    stock: 32,
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 203,
    tags: ['su arıtma', 'RO', 'temiz su'],
    images: [
      { url: '/images/products/prd-004-1.jpg', alt: 'PureFlow Su Arıtma', isPrimary: true },
      { url: '/images/products/prd-004-2.jpg', alt: 'PureFlow Filtre Sistemi', isPrimary: false },
    ],
    specs: [
      { name: 'Kapasite', value: '190', unit: 'L/gün' },
      { name: 'Aşama Sayısı', value: '6' },
      { name: 'Filtre Ömrü', value: '12', unit: 'ay' },
      { name: 'Basınç Pompası', value: 'Var' },
      { name: 'TDS Monitör', value: 'Dijital' },
      { name: 'Tank Kapasitesi', value: '12', unit: 'litre' },
    ],
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-06-15T08:00:00Z',
  },
  {
    id: 'prd-005',
    name: 'CoolMax Inverter Klima 12.000 BTU',
    slug: 'coolmax-inverter-klima-12000-btu',
    shortDescription: 'A++ enerji sınıfı, akıllı wifi kontrollü inverter klima.',
    description:
      'CoolMax Inverter Klima, A++ enerji verimliliği sınıfıyla enerji tüketimini %40 azaltır. Wifi modülü sayesinde uygulamayla uzaktan kontrol edilebilir.',
    price: 18500,
    salePrice: 16200,
    brand: 'alb-su-aritma',
    category: MOCK_CATEGORIES_ALBSU[1],
    sku: 'CM-INV-12',
    unit: 'adet',
    stock: 18,
    isFeatured: true,
    isActive: true,
    rating: 4.7,
    reviewCount: 156,
    tags: ['klima', 'inverter', 'wifi', 'a++'],
    images: [
      { url: '/images/products/prd-005-1.jpg', alt: 'CoolMax Klima İç Ünite', isPrimary: true },
      { url: '/images/products/prd-005-2.jpg', alt: 'CoolMax Klima Dış Ünite', isPrimary: false },
    ],
    specs: [
      { name: 'Soğutma Kapasitesi', value: '12.000', unit: 'BTU' },
      { name: 'Enerji Sınıfı', value: 'A++' },
      { name: 'COP', value: '4.2' },
      { name: 'Ses Seviyesi', value: '22', unit: 'dB(A)' },
      { name: 'WiFi', value: 'Var (Google/Alexa)' },
      { name: 'Filtre', value: 'Gümüş iyon + PM2.5' },
      { name: 'Garanti', value: '3 yıl' },
    ],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-06-20T08:00:00Z',
  },
];

// ─── BLOG YAZILARI ────────────────────────────────────────────────────────────

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: 'Buğday Sezonunda Doğru Gübreleme Rehberi 2026',
    slug: 'bugday-sezonunda-dogru-gübreleme-2026',
    excerpt: 'Buğday ekiminde verim kaybını önlemek için uygulanması gereken gübre miktarları, zamanlaması ve uygulama teknikleri.',
    content: '<!-- Makale içeriği sonradan eklenecek -->',
    // GÖRSEL: /public/images/blog/blog-001.jpg
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

// ─── MÜŞTERİ YORUMLARI ───────────────────────────────────────────────────────

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Hasan Demir',
    location: 'Konya',
    role: 'Buğday Üreticisi',
    body: 'ALB Tarım gübrelerini 3 yıldır kullanıyorum. Verimim geçen yıla göre %25 arttı. Teknik destek ekibi her zaman yardımcı oluyor.',
    rating: 5,
    brand: 'alb-tarim',
    // GÖRSEL: /public/images/testimonials/tarim-1.jpg
    image: '/images/testimonials/tarim-1.jpg',
  },
  {
    id: 2,
    name: 'Fatma Şahin',
    location: 'Antalya',
    role: 'Sera İşletmecisi',
    body: 'Damla sulama sistemini kurdurduğumdan beri su faturam yarı yarıya düştü. Kurulum ekibi çok profesyoneldi, teşekkürler.',
    rating: 5,
    brand: 'alb-tarim',
    image: '/images/testimonials/tarim-2.jpg',
  },
  {
    id: 3,
    name: 'Ali Koç',
    location: 'Ankara',
    role: 'Ev Kullanıcısı',
    body: 'PureFlow su arıtma cihazı harika. Artık şişe su almıyoruz, musluk suyumuz tertemiz. Montaj aynı gün yapıldı.',
    rating: 5,
    brand: 'alb-su-aritma',
    image: '/images/testimonials/albsu-1.jpg',
  },
  {
    id: 4,
    name: 'Zeynep Aydın',
    location: 'İzmir',
    role: 'Ofis Yöneticisi',
    body: 'CoolMax klimayı ofisimize taktırdık. Hem ses hem de elektrik tüketimi çok düşük. Wifi özelliği çok kullanışlı.',
    rating: 4,
    brand: 'alb-su-aritma',
    image: '/images/testimonials/albsu-2.jpg',
  },
];

// ─── HİZMETLER ───────────────────────────────────────────────────────────────

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
    title: 'Su Arıtma Montajı',
    description: 'Satın aldığınız su arıtma cihazını uzman ekibimiz montaj güvencesiyle kuruyor.',
    icon: '🔩',
    features: ['Ücretsiz montaj', 'Su kalitesi testi', 'Kullanım eğitimi', '2 yıl garanti'],
    brand: 'alb-su-aritma',
    price: 'Ücretsiz',
  },
  {
    id: 11,
    title: 'Periyodik Bakım',
    description: 'Klima ve su arıtma cihazlarınız için yıllık bakım ve filtre değişim hizmeti.',
    icon: '🛠️',
    features: ['Filtre değişimi', 'Gaz kontrolü', 'Teknik rapor', 'Öncelikli servis'],
    brand: 'alb-su-aritma',
    price: 'Yıllık sözleşme',
  },
  {
    id: 12,
    title: '7/24 Teknik Destek',
    description: 'Arıza durumunda 4 saat içinde teknisyen desteği, uzaktan teknik yardım.',
    icon: '📞',
    features: ['4 saat içinde müdahale', 'Uzaktan destek', 'Orijinal yedek parça', 'Garanti kapsamı'],
    brand: 'alb-su-aritma',
    price: 'Garanti dahilinde',
  },
];
