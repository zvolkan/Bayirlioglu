import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bayilik Başvurusu',
  description: 'Bayilik başvuru formu.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
