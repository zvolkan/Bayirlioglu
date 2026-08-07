import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bayilik Başvurusu | Bayırlıoğlu',
  description: 'ALB Tarım ve Alb Su Teknolojileri bayilik başvurusu. Cazip komisyon, ücretsiz eğitim ve teknik destek.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
