import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ACTIVE_BRAND_KEY } from '@/lib/constants'

/**
 * Eski (marka öncesi) ürün detay rotası.
 *
 * Sahte `MOCK_PRODUCTS` verisinden besleniyordu. Artık ürünün gerçek markasını
 * veritabanından bulup doğru adrese yönlendiriyor — eski bağlantılar ve arama
 * motoru kayıtları bozulmuyor.
 */
export default async function EskiUrunDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { brand: { select: { key: true } } },
  })

  if (!product) {
    redirect(`/${ACTIVE_BRAND_KEY}/urunler`)
  }

  redirect(`/${product.brand.key}/urunler/${slug}`)
}
