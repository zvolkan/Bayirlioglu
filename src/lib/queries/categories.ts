import { prisma } from '@/lib/db'
import type { Category, BrandKey } from '@/lib/types'

function toCategory(c: {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  imageUrl: string | null
  sortOrder: number
  brand: { key: string }
  _count?: { products: number }
}): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? undefined,
    icon: c.icon ?? undefined,
    image: c.imageUrl ?? undefined,
    brand: c.brand.key as BrandKey,
    sortOrder: c.sortOrder,
    productCount: c._count?.products,
  }
}

/** Marka'ya ait aktif kategoriler (ürün sayısıyla birlikte) */
export async function getCategoriesByBrand(brandKey: string): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    where: { brand: { key: brandKey }, isActive: true },
    include: {
      brand: true,
      _count: {
        select: { products: { where: { isActive: true } } },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })
  return rows.map(toCategory)
}
