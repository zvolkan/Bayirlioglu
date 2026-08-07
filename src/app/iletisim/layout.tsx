import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İletişim | Bayırlıoğlu',
  description: 'Sorularınız, önerileriniz ve hizmet talepleriniz için bize ulaşın. Anamur/Mersin merkezli Bayırlıoğlu iletişim bilgileri.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
