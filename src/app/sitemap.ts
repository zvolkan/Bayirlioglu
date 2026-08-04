import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { SITE_CONFIG } from '@/lib/constants'

/**
 * Site haritası.
 *
 * Eskiden `MOCK_PRODUCTS` ve `MOCK_BLOG_POSTS` sabitlerinden üretiliyordu; yani
 * Google'a veritabanında var olmayan ürün adresleri bildiriliyordu. Artık
 * gerçek verilerden üretiliyor.
 */

export const revalidate = 3600 // saatte bir yenile

const BRAND_KEYS = ['alb-tarim', 'alb-su-aritma'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_CONFIG.url.replace(/\/+$/, '')
  const now = new Date()

  // ── Genel (marka dışı) sayfalar ──────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/hakkimizda`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/hizmetler`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/iletisim`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/bayi-basvuru`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/siparis-takibi`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/gizlilik`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/kvkk`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    {
      url: `${base}/kullanim-kosullari`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${base}/iade-politikasi`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  // ── Marka sayfaları ──────────────────────────────────────────────────────
  const brandRoutes: MetadataRoute.Sitemap = BRAND_KEYS.flatMap((key) => [
    { url: `${base}/${key}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.9 },
    {
      url: `${base}/${key}/urunler`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${base}/${key}/hakkimizda`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${base}/${key}/hizmetler`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${base}/${key}/iletisim`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${base}/${key}/blog`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
  ])

  // ── Gerçek ürünler ───────────────────────────────────────────────────────
  let productRoutes: MetadataRoute.Sitemap = []

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, brand: { select: { key: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    })

    productRoutes = products.map(
      (product: { slug: string; updatedAt: Date; brand: { key: string } }) => ({
        url: `${base}/${product.brand.key}/urunler/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }),
    )
  } catch (error) {
    // Veritabanına ulaşılamazsa site haritası yine de üretilsin
    console.error('[sitemap] ürünler alınamadı:', error)
  }

  return [...staticRoutes, ...brandRoutes, ...productRoutes]
}
