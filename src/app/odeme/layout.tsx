import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ödeme | Bayırlıoğlu',
  description: 'Siparişinizi güvenle tamamlayın.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
