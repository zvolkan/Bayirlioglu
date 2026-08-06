import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/animations.css'
import '@/styles/brand.css'
import { BRAND, SITE_CONFIG, ACTIVE_BRAND_KEY } from '@/lib/constants'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import PageTransition from '@/components/layout/PageTransition'
import ScrollProgress from '@/components/layout/ScrollProgress'
import CookieConsent from '@/components/layout/CookieConsent'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  // metadataBase olmadan göreli OG görsel yolları çözülmüyor ve WhatsApp /
  // Facebook paylaşımlarında link önizlemesi görselsiz çıkıyordu.
  metadataBase: new URL(SITE_CONFIG.url),
  title: { template: `%s | ${BRAND.name}`, default: BRAND.name },
  description: BRAND.description,
  keywords: ACTIVE_BRAND_KEY === 'alb-tarim'
    ? ['alb tarım', 'gübre', 'sulama sistemi', 'tarım ilaçları', 'organik gübre']
    : ['albsu', 'su arıtma', 'klima', 'su arıtma cihazı', 'ev elektroniği'],
  openGraph: {
    type: 'website', locale: 'tr_TR',
    siteName: BRAND.name, title: BRAND.name, description: BRAND.description,
  },
  robots: { index: true, follow: true },
}

/**
 * Aktif markayı yoldan çözer.
 *
 * Marka renkleri CSS değişkenleriyle geliyor ve Header/Footer kök düzende
 * olduğu için değişkenlerin <html> üzerinde tanımlı olması gerekiyor.
 * Middleware her istekte `x-pathname` başlığını gönderiyor.
 */
async function resolveBrand(): Promise<'alb-tarim' | 'alb-su-aritma' | 'grup'> {
  const pathname = (await headers()).get('x-pathname') ?? ''
  if (pathname.startsWith('/alb-su-aritma')) return 'alb-su-aritma'
  // Grup ana sayfası kendi kimliğini kullanıyor. Sepet, ödeme, hesap gibi
  // ortak sayfalarda ana marka olan ALB Tarım geçerli sayılıyor; buralarda
  // birincil butonlar zaten nötr koyu renkte, marka rengi yalnızca ikincil
  // vurgu olarak görünüyor.
  if (pathname === '/') return 'grup'
  return 'alb-tarim'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await resolveBrand()

  return (
    <html lang="tr" data-brand={brand} className={inter.variable}>
      <body>
        {/* Klavye kullanıcıları için: sekme ile odaklanınca görünür olur */}
        <a
          href="#ana-icerik"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          Ana içeriğe atla
        </a>

        {/* Arama motorları için kurum bilgisi */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Bayırlıoğlu Grup',
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
        <ScrollProgress />
        <Header />
        <main id="ana-icerik" tabIndex={-1}>
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <WhatsAppButton />
        <CookieConsent />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontFamily: 'var(--font-inter)' } }} />
      </body>
    </html>
  )
}
