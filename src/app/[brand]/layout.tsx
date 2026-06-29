import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BRANDS } from '@/lib/constants'
import type { BrandKey } from '@/lib/types'

const VALID_BRANDS: BrandKey[] = ['alb-tarim', 'alb-su-aritma']

interface BrandLayoutProps {
  children: React.ReactNode
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: BrandLayoutProps): Promise<Metadata> {
  const { brand } = await params
  if (!VALID_BRANDS.includes(brand as BrandKey)) return {}

  const cfg = BRANDS[brand as BrandKey]
  return {
    title: {
      default: cfg.name,
      template: `%s | ${cfg.name}`,
    },
    description: cfg.description,
    keywords: [cfg.name, 'Bayırlıoğlu Grup', ...cfg.nav.map((n) => n.label)],
    openGraph: {
      siteName: `${cfg.name} — Bayırlıoğlu Grup`,
    },
  }
}

export async function generateStaticParams() {
  return VALID_BRANDS.map((brand) => ({ brand }))
}

export default async function BrandLayout({ children, params }: BrandLayoutProps) {
  const { brand } = await params

  if (!VALID_BRANDS.includes(brand as BrandKey)) {
    notFound()
  }

  return <>{children}</>
}
