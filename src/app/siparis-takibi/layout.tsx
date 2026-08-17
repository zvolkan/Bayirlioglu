import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sipariş Takibi',
  description: 'Sipariş numaranız ve e-posta adresinizle siparişinizin durumunu ve kargo takip bilgisini sorgulayın.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
