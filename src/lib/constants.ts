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
      'Organik gübrelerden akıllı sulama sistemlerine kadar verimliliğinizi artıran çözümler sunuyoruz. Ürün seçiminde yardımcı oluyor, siparişinizi kargoyla adresinize gönderiyoruz.',
    badge: '2026 Yeni Sezon Ürünleri Mevcut',
    cta: { label: 'Ürünlerimizi İnceleyin', href: '/urunler' },
    ctaSecondary: { label: 'Ücretsiz Danışmanlık Al', href: '/iletisim' },
    whatsapp: {
      phone: process.env.NEXT_PUBLIC_WHATSAPP_ALB_TARIM ?? '905071781633',
      message: 'Merhaba! ALB Tarım ürünleri hakkında bilgi almak istiyorum.',
      tooltip: "ALB Tarım'a WhatsApp'tan yazın!",
    },
    // Doğrulanabilir olmayan rakamlar kaldırıldı ("500+ Ürün Çeşidi" katalogda
    // 69 ürün varken yazıyordu; "15.000+ Mutlu Çiftçi" ölçülebilir değil).
    // Gerçek rakamlarınız olduğunda buraya yazın, site geneline yansır.
    stats: [
      { value: 'Anamur', label: 'Merkez' },
      { value: '81 İl', label: 'Kargo ile Teslimat' },
      { value: '11 Marka', label: 'Yetkili Tedarik' },
    ],
    nav: [
      {
        label: 'Ürünler',
        href: '/urunler',
        children: [
          { label: 'ALB Tarım Ürünleri', href: '/urunler?kullanim=alb-tarim-urunleri' },
          { label: 'İthal Ürünler', href: '/urunler?kullanim=ithal-urunler' },
        ],
      },
      { label: 'Hizmetler', href: '/hizmetler' },
      // Sayfa iki marka için de yazılmıştı ama yalnızca ALB Su menüsündeydi;
      // ALB Tarım tarafında hiçbir bağlantısı yoktu.
      { label: 'Hizmet Alanlarımız', href: '/referanslar' },
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
      gradientOverlay: 'from-green-950/60 via-green-900/35 to-emerald-950/50',
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
      'Eviniz için tezgah altı RO ve alkali su cihazları; iş yeriniz için arıtmalı su sebili ve endüstriyel sistemler. Ücretsiz profesyonel montaj, dünya markası membranlar ve yerinde teknik servis ile.',
    badge: 'Ücretsiz Montaj & 2 Yıl Garanti',
    cta: { label: 'Ürünlerimizi İnceleyin', href: '/urunler' },
    ctaSecondary: { label: 'Ücretsiz Teklif Al', href: '/iletisim' },
    whatsapp: {
      phone: process.env.NEXT_PUBLIC_WHATSAPP_ALBSU ?? '905444142254',
      message: 'Merhaba! Alb Su Teknolojileri su arıtma sistemleri hakkında bilgi almak istiyorum.',
      tooltip: "Alb Su Teknolojileri'ne WhatsApp'tan yazın!",
    },
    // Doğrulanabilir olmayan rakamlar kaldırıldı.
    stats: [
      { value: 'Anamur', label: 'Merkez' },
      { value: 'Ücretsiz', label: 'Su Analizi' },
      { value: 'Yerinde', label: 'Montaj & Servis' },
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

// ─── BAYIRLIOĞLU (marka dışı sayfalar: landing, hakkımızda, bayi vb.) ───

export const GROUP_WHATSAPP = {
  phone: process.env.NEXT_PUBLIC_WHATSAPP_GROUP ?? '905444142254',
  message: 'Merhaba! Bayırlıoğlu hakkında bilgi almak istiyorum.',
  tooltip: "Bayırlıoğlu'na WhatsApp'tan yazın!",
};

// ─── AKTİF MARKA (env'den okur) ──────────────────────────────────────────────

export const ACTIVE_BRAND_KEY: BrandKey =
  (process.env.NEXT_PUBLIC_BRAND as BrandKey) ?? 'alb-tarim';

export const BRAND = BRANDS[ACTIVE_BRAND_KEY];

/**
 * Şirketin kendi adı — TEK KAYNAK.
 *
 * `BRAND.name` aktif MARKAYI verir (ALB Tarım veya Alb Su Teknolojileri).
 * Gizlilik politikası, kullanım koşulları ve mesafeli satış sözleşmesi gibi
 * metinler markaya değil ŞİRKETE ait olduğu için `BRAND.name` kullanmak
 * yanlıştı: gizlilik politikası "ALB Tarım olarak…" diye başlıyordu.
 *
 * Kurumsal/hukuki metinlerde bunu, marka sayfalarında `BRAND.name` kullanın.
 */
export const COMPANY_NAME = 'Bayırlıoğlu';

/**
 * Kuruluş yılı — TEK KAYNAK.
 *
 * Site içinde üç ayrı yıl yazıyordu (2000, 2003, 2006). Hangisinin doğru
 * olduğunu yalnızca siz bilebilirsiniz: LÜTFEN BU YILI DOĞRULAYIN. Yıl
 * değişirse burayı değiştirmeniz yeterli, tüm sayfalara yansır.
 *
 * Kaç yıllık deneyim olduğu ("20 yılı aşkın" gibi) hiçbir yerde yazmıyor;
 * yalnızca kuruluş yılı belirtiliyor.
 */
export const KURULUS_YILI = 2006;

// ─── GENEL SABİTLER ───────────────────────────────────────────────────────────

export const SITE_CONFIG = {
  name: BRAND.name,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  phone: '+90 544 414 22 54',
  email: 'info@bayirlioglu.com',
  address:
    'SAÇKAN KAVŞAĞI DOĞUSU SAVCI-ŞOK MARKET YANI, Yeşilyurt, Akdeniz Cd. NO:20/22, 33640 Anamur/Mersin',
  mapsUrl:
    'https://www.google.com/maps/place//data=!4m2!3m1!1s0x14dc3d918f947551:0x35f4224c2a7044c3?sa=X&ved=1t:8290&ictx=111',
  workingHours: 'Pzt – Cmt: 08:30 – 19:00',
  // Yalnızca gerçekten var olan hesaplar. Burası arama motoruna verilen
  // `sameAs` listesini besliyor; olmayan bir profili buraya yazmak Google'a
  // yanlış kurum eşleştirmesi yaptırır. Facebook / X / YouTube hesabı
  // açılırsa buraya eklenmesi yeterli, footer ayrıca güncellenmeli.
  socialMedia: {
    instagramTarim: 'https://www.instagram.com/alb.tarim',
    instagramSu: 'https://www.instagram.com/albsuteknolojileri',
  },
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
