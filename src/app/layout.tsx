import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/animations.css'
import { BRAND, SITE_CONFIG, ACTIVE_BRAND_KEY } from '@/lib/constants'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import PageTransition from '@/components/layout/PageTransition'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
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
        <Header />
        <main>
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
