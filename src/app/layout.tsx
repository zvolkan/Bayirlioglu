import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// @ts-ignore: allow side-effect import of global CSS
import './globals.css'
import { BRAND, SITE_CONFIG, ACTIVE_BRAND_KEY } from '@/lib/constants'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
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
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontFamily: 'var(--font-inter)' } }} />
      </body>
    </html>
  )
}
