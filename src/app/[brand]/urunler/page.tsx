import { Suspense } from 'react'
import type { Metadata } from 'next'
import { BRANDS } from '@/lib/constants'
import { getProductsByBrand } from '@/lib/queries/products'
import { getCategoriesByBrand } from '@/lib/queries/categories'
import type { BrandKey } from '@/lib/types'
import UrunlerContent from './UrunlerContent'

interface Props {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  const cfg = BRANDS[brand as BrandKey]
  if (!cfg) return {}
  return {
    title: `Ürünler — ${cfg.name}`,
    description: `${cfg.name} ürün kataloğu`,
  }
}

// Vercel'de her istekte taze veri çekilir (ISR yerine dynamic)
export const dynamic = 'force-dynamic'

export default async function UrunlerPage({ params }: Props) {
  const { brand } = await params
  const brandKey = brand as BrandKey

  const [products, categories] = await Promise.all([
    getProductsByBrand(brandKey),
    getCategoriesByBrand(brandKey),
  ])

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      }
    >
      <UrunlerContent
        brandKey={brandKey}
        initialProducts={products}
        initialCategories={categories}
      />
    </Suspense>
  )
}
