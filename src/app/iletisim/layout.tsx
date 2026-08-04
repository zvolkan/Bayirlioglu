import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İletişim | Bayırlıoğlu Grup',
  description: 'Sorularınız, önerileriniz ve hizmet talepleriniz için bize ulaşın. Anamur/Mersin merkezli Bayırlıoğlu Grup iletişim bilgileri.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
