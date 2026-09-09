import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/animations.css'
import '@/styles/brand.css'
import { BRAND, SITE_CONFIG, ACTIVE_BRAND_KEY, COMPANY_NAME, KURULUS_YILI } from '@/lib/constants'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import PageTransition from '@/components/layout/PageTransition'
import ScrollProgress from '@/components/layout/ScrollProgress'
import BrandSync from '@/components/layout/BrandSync'
import { brandFromPath, type ActiveBrand } from '@/lib/brand-path'
import CookieConsent from '@/components/layout/CookieConsent'
import { Toaster } from 'react-hot-toast'
import { jsonLdScript } from '@/lib/sanitize'

/**
 * DİKKAT — `latin-ext` şart.
 *
 * Türkçenin ı, ğ, ş, İ, Ğ, Ş harfleri Inter'in `latin` alt kümesinde YOK;
 * `latin-ext` içindeler. Yalnızca `latin` yüklendiğinde tarayıcı bu harfleri
 * yazı tipinde bulamayıp sistem yazı tipine düşüyordu. Sonuç, aynı kelimenin
 * iki farklı yazı tipiyle çizilmesi: "Bayırlıoğlu" kelimesinde B-a-y-r-l-o-l-u
 * Inter'den, ı ve ğ başka bir yazı tipinden geliyordu. Harf genişlikleri ve
 * özellikle alt kuyruk derinlikleri tutmadığı için satır kutusuna sığmıyor,
 * kuyruklar kesik görünüyordu.
 *
 * Türkçe bir sitede bu alt küme opsiyonel değil.
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  // metadataBase olmadan göreli OG görsel yolları çözülmüyor ve WhatsApp /
  // Facebook paylaşımlarında link önizlemesi görselsiz çıkıyordu.
  metadataBase: new URL(SITE_CONFIG.url),
  // Kurumsal ve hukuki sayfalar bu şablonu kullanıyor; marka sayfaları
  // kendi metadata'sıyla eziyor. Burada marka adı yazınca gizlilik/kullanım
  // koşulları başlıklarında "ALB Tarım" çıkıyordu.
  title: { template: `%s | ${COMPANY_NAME}`, default: COMPANY_NAME },
  description: BRAND.description,
  keywords: ACTIVE_BRAND_KEY === 'alb-tarim'
    // ── SEO anahtar kelimeleri: neyin OLMADIĞINA dikkat ──────────────────
    //
    // 'zirai ilaç' ve 'tarım ilaçları' KALDIRILDI ve bir daha eklenmemeli.
    // Zirai ilacın internetten satışı mevzuat gereği yasak; satmadığınız ve
    // satamayacağınız bir ürün için arama trafiği çekmek yalnızca yanıltıcı
    // değil, denetimde aleyhe delil olur.
    //
    // 'tarım ekipmanları' da kaldırıldı: ekipman satışı yok. ALB Tarım'ın
    // sattığı tek ürün grubu gübre; yanında zirai danışmanlık veriliyor.
    ? ['alb tarım', 'gübre', 'organik gübre', 'damla sulama gübresi', 'yaprak gübresi', 'zirai danışmanlık']
    : ['albsu', 'su arıtma', 'klima', 'su arıtma cihazı', 'filtre', 'yedek parça'],
  openGraph: {
    type: 'website', locale: 'tr_TR',
    siteName: COMPANY_NAME, title: COMPANY_NAME, description: BRAND.description,
  },
  robots: { index: true, follow: true },
}

/**
 * İlk boyama için sunucu tarafında markayı belirler.
 *
 * DİKKAT: Bu değer YALNIZCA ilk yüklemede geçerli. Next.js kök düzeni rotalar
 * arasında paylaştığı ve istemci tarafı gezinmede yeniden render etmediği için
 * sonraki geçişlerde `<BrandSync />` bileşeni niteliği güncelliyor. İkisi
 * birlikte çalışmalı — biri eksikse renkler ya sıçrar ya da takılı kalır.
 */
async function resolveBrand(): Promise<ActiveBrand> {
  const pathname = (await headers()).get('x-pathname') ?? ''
  return brandFromPath(pathname)
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await resolveBrand()
  const yonetimPaneli = ((await headers()).get('x-pathname') ?? '').startsWith('/admin')

  return (
    <html lang="tr" data-brand={brand} className={inter.variable}>
      <body>
        {/* Klavye kullanıcıları için: sekme ile odaklanınca görünür olur */}
        <a
          href="#ana-icerik"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          Ana içeriğe atla
        </a>

        {/* Arama motorları için kurum bilgisi.
            NOT: Buraya CSP nonce'u KONMUYOR. `type="application/ld+json"`
            çalıştırılabilir bir script değil, bu yüzden CSP script-src onu
            engellemiyor (tarayıcıda doğrulandı: nonce'suz da ihlal yok).
            Nonce eklendiğinde ise tarayıcı yükleme sonrası nonce niteliğini
            temizlediği için React hidrasyon uyumsuzluğu uyarısı veriyordu. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: COMPANY_NAME,
              // Kesin tescil yılı yok; arama motoru yapısal veride bir yıl istiyor.
              foundingDate: String(KURULUS_YILI),
              url: SITE_CONFIG.url,
              email: SITE_CONFIG.email,
              telephone: SITE_CONFIG.phone,
              address: {
                '@type': 'PostalAddress',
                streetAddress: SITE_CONFIG.address,
                addressLocality: 'Anamur',
                addressRegion: 'Mersin',
                addressCountry: 'TR',
              },
              sameAs: Object.values(SITE_CONFIG.socialMedia),
            }),
          }}
        />
        {/* Yönetici paneli mağaza kabuğunu kullanmıyor.
            Bu ayrım olmadan panelde marka değiştirici, sepet, arama, yasal
            künyeli altbilgi, WhatsApp butonu ve çerez bandı da görünüyordu;
            mobil panelde ekranın yarısını kaplıyordu. */}
        {yonetimPaneli ? (
          <main id="ana-icerik" tabIndex={-1}>
            {children}
          </main>
        ) : (
          <>
            <BrandSync />
            <ScrollProgress />
            <Header />
            <main id="ana-icerik" tabIndex={-1}>
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <WhatsAppButton />
            <CookieConsent />
          </>
        )}
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontFamily: 'var(--font-inter)' } }} />
      </body>
    </html>
  )
}
