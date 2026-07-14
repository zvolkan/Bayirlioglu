import type { BrandConfig, BrandKey } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// MARKA YAPILANDIRMALARI
// .env.local'da NEXT_PUBLIC_BRAND değerini 'alb-tarim' veya 'alb-su-aritma'
// olarak ayarlayarak aktif markayı değiştirebilirsiniz.
// ─────────────────────────────────────────────────────────────────────────────

export const BRANDS: Record<BrandKey, BrandConfig> = {
  'alb-tarim': {
    key: 'alb-tarim',
    name: 'ALB Tarım',
    shortCode: 'AT',
    tagline: 'Toprağınıza\nDeğer Katın',
    subtitle: 'Modern tarım teknolojileriyle',
    description:
      "Organik gübrelerden akıllı sulama sistemlerine kadar verimliliğinizi artıran çözümler sunuyoruz. Türkiye'nin güvendiği tarım partneri — doğru ürün, uzman destek, hızlı teslimat.",
    badge: '🌾 2026 Yeni Sezon Ürünleri Mevcut',
    cta: { label: 'Ürünlerimizi İnceleyin', href: '/urunler' },
    ctaSecondary: { label: 'Ücretsiz Danışmanlık Al', href: '/iletisim' },
    whatsapp: {
      phone: process.env.NEXT_PUBLIC_WHATSAPP_ALB_TARIM ?? '905071781633',
      message: 'Merhaba! ALB Tarım ürünleri hakkında bilgi almak istiyorum.',
      tooltip: "ALB Tarım'a WhatsApp'tan yazın!",
    },
    stats: [
      { value: '500+', label: 'Ürün Çeşidi' },
      { value: '15.000+', label: 'Mutlu Çiftçi' },
      { value: '81 İl', label: 'Teslimat' },
    ],
    nav: [
      {
        label: 'Ürünler',
        href: '/urunler',
        children: [
          { label: 'ALB Tarım Ürünleri', href: '/urunler?kullanim=alb-tarim-urunleri' },
          { label: 'İthal Ürünler', href: '/urunler?kullanim=ithal-urunler' },
          { label: 'Toptancısı Olunanlar', href: '/urunler?kullanim=toptanci-olunanlar' },
          { label: 'Bayilik Olunanlar', href: '/urunler?kullanim=bayilik-olunanlar' },
        ],
      },
      {
        label: 'İthal Ürünler',
        href: '/urunler?kullanim=ithal-urunler',
        children: [
          { label: 'Taban Gübresi', href: '/urunler?kullanim=ithal-urunler&kategori=taban-gubresi' },
          { label: 'Damla Sulama Gübreleri', href: '/urunler?kullanim=ithal-urunler&kategori=damla-sulama-gubreleri' },
          { label: 'Yaprak Gübreleri', href: '/urunler?kullanim=ithal-urunler&kategori=yaprak-gubreleri' },
          { label: 'Mikro Elementler', href: '/urunler?kullanim=ithal-urunler&kategori=mikro-elementler' },
        ],
      },
      { label: 'Hizmetler', href: '/hizmetler' },
      { label: 'Blog', href: '/blog' },
      { label: 'Hakkımızda', href: '/hakkimizda' },
      { label: 'İletişim', href: '/iletisim' },
    ],
    video: '/videos/tarim-hero-desktop.mp4',
    videoMobile: '/videos/tarim-hero-mobile.mp4',
    poster: '/images/tarim-hero.jpg',
    colors: {
      primary: 'bg-green-600',
      primaryHover: 'hover:bg-green-500',
      primaryText: 'text-green-600',
      primaryLight: 'bg-green-50',
      primaryBorder: 'border-green-200',
      gradientOverlay: 'from-green-950/90 via-green-900/70 to-emerald-950/80',
      fallbackGradient: 'bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900',
      logoBg: 'bg-green-600',
      accentPrimary:
        'bg-green-600 hover:bg-green-500 text-white shadow-green-600/30 focus:ring-green-500',
      accentSecondary:
        'border-2 border-green-400/60 text-white hover:bg-green-400/10 focus:ring-green-400',
      badgeStyle: 'bg-green-500/15 border border-green-400/30 text-green-300',
      statDivider: 'bg-green-500/40',
      navHover: 'hover:text-green-400',
      ring: 'focus:ring-green-500',
    },
  },

  'alb-su-aritma': {
    key: 'alb-su-aritma',
    name: 'Alb Su Teknolojileri',
    shortCode: 'AS',
    tagline: 'Sağlık için,\nAlkali su için',
    subtitle: 'Alkali & endüstriyel su teknolojileriyle',
    description:
      'Eviniz için tezgah altı RO ve alkali su cihazları; iş yeriniz için arıtmalı su sebili ve endüstriyel sistemler. Ücretsiz profesyonel montaj, dünya markası membranlar ve 7/24 teknik servis güvencesiyle.',
    badge: '💧 Ücretsiz Montaj & 2 Yıl Garanti',
    cta: { label: 'Ürünlerimizi İnceleyin', href: '/urunler' },
    ctaSecondary: { label: 'Ücretsiz Teklif Al', href: '/iletisim' },
    whatsapp: {
      phone: process.env.NEXT_PUBLIC_WHATSAPP_ALBSU ?? '905007654321',
      message: 'Merhaba! Alb Su Teknolojileri su arıtma sistemleri hakkında bilgi almak istiyorum.',
      tooltip: "Alb Su Teknolojileri'ne WhatsApp'tan yazın!",
    },
    stats: [
      { value: '1.000+', label: 'Kurulum' },
      { value: '20+', label: 'Yıl Deneyim' },
      { value: '7/24', label: 'Teknik Destek' },
    ],
    nav: [
      {
        label: 'Tüm Ürünler',
        href: '/urunler',
        children: [
          { label: 'Tüm Ürünler', href: '/urunler' },
          { label: 'Eviniz İçin', href: '/urunler?kullanim=ev' },
          { label: 'İş Yeriniz İçin', href: '/urunler?kullanim=is-yeri' },
          { label: 'Arıtmalı Su Sebili', href: '/urunler?kullanim=is-yeri&kategori=su-sebili' },
          { label: 'Filtre & Membran', href: '/urunler?kullanim=yedek-parca&kategori=filtre' },
          { label: 'Endüstriyel Sistemler', href: '/urunler?kullanim=is-yeri&kategori=endustriyel' },
          { label: 'Yedek Parça & Aksesuar', href: '/urunler?kullanim=yedek-parca' },
        ],
      },
      { label: 'Eviniz İçin', href: '/urunler?kullanim=ev' },
      { label: 'İş Yeriniz İçin', href: '/urunler?kullanim=is-yeri' },
      { label: 'Servis', href: '/hizmetler' },
      { label: 'Referanslar', href: '/referanslar' },
      { label: 'İletişim', href: '/iletisim' },
    ],
    video: '/videos/su-aritma-hero.mp4',
    poster: '/images/su-aritma-hero.jpg',
    colors: {
      primary: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-500',
      primaryText: 'text-blue-600',
      primaryLight: 'bg-blue-50',
      primaryBorder: 'border-blue-200',
      gradientOverlay: 'from-blue-950/90 via-blue-900/70 to-cyan-950/80',
      fallbackGradient: 'bg-gradient-to-br from-blue-900 via-cyan-800 to-sky-900',
      logoBg: 'bg-blue-600',
      accentPrimary:
        'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 focus:ring-blue-500',
      accentSecondary:
        'border-2 border-blue-400/60 text-white hover:bg-blue-400/10 focus:ring-blue-400',
      badgeStyle: 'bg-blue-500/15 border border-blue-400/30 text-blue-300',
      statDivider: 'bg-blue-500/40',
      navHover: 'hover:text-blue-400',
      ring: 'focus:ring-blue-500',
    },
  },
};

// ─── AKTİF MARKA (env'den okur) ──────────────────────────────────────────────

export const ACTIVE_BRAND_KEY: BrandKey =
  (process.env.NEXT_PUBLIC_BRAND as BrandKey) ?? 'alb-tarim';

export const BRAND = BRANDS[ACTIVE_BRAND_KEY];

// ─── GENEL SABİTLER ───────────────────────────────────────────────────────────

export const SITE_CONFIG = {
  name: BRAND.name,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  phone: '+90 500 123 45 67',
  email: 'info@albgrup.com.tr',
  address: 'Atatürk Caddesi No:1, Ankara / Türkiye',
  workingHours: 'Pazartesi – Cumartesi: 08:00 – 18:00',
  socialMedia: {
    instagram: 'https://instagram.com/albgrup',
    facebook: 'https://facebook.com/albgrup',
    youtube: 'https://youtube.com/@albgrup',
    twitter: 'https://twitter.com/albgrup',
  },
};

export const PAGINATION_PAGE_SIZE = 12;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  confirmed: 'Onaylandı',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoya Verildi',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
  refunded: 'İade Edildi',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: 'Kredi / Banka Kartı',
  bank_transfer: 'Havale / EFT',
  cash_on_delivery: 'Kapıda Ödeme',
};

export const TURKISH_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya',
  'Ankara', 'Antalya', 'Ardahan', 'Artvin', 'Aydın', 'Balıkesir',
  'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis',
  'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
  'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir', 'Kahramanmaraş',
  'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale',
  'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya',
  'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya',
  'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak',
  'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van',
  'Yalova', 'Yozgat', 'Zonguldak',
];
