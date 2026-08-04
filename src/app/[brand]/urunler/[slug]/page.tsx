import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import ProductImage from '@/components/product/ProductImage'
import { BRANDS } from '@/lib/constants'
import { getProductBySlug, getRelatedProducts } from '@/lib/queries/products'
import { shouldShowRating } from '@/lib/reviews'
import type { BrandKey } from '@/lib/types'
import AddToCartButton from '@/components/product/AddToCartButton'

interface Props {
  params: Promise<{ brand: string; slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, brand } = await params
  const product = await getProductBySlug(slug, brand)

  if (!product) {
    return { title: 'Ürün bulunamadı', robots: { index: false, follow: false } }
  }

  const cfg = BRANDS[brand as BrandKey] ?? BRANDS['alb-tarim']
  const price = product.salePrice ?? product.price
  const description =
    product.shortDescription?.trim() ||
    `${product.name} — ${cfg.name} güvencesiyle. ${price.toLocaleString('tr-TR')} ₺`
  const image = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url

  return {
    title: product.name,
    description: description.slice(0, 160),
    alternates: { canonical: `/${brand}/urunler/${slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} | ${cfg.name}`,
      description: description.slice(0, 200),
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { brand, slug } = await params
  const brandKey = brand as BrandKey

  const product = await getProductBySlug(slug, brandKey)
  if (!product) notFound()

  const cfg = BRANDS[brandKey] ?? BRANDS['alb-tarim']
  const isAlbSu = brandKey === 'alb-su-aritma'
  const accentText = isAlbSu ? 'text-blue-600' : 'text-green-600'
  const primaryBtn = isAlbSu ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
  const badgeBg = isAlbSu ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'

  const displayPrice = product.salePrice ?? product.price
  const discount = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : null
  const primaryImg = product.images?.find((i) => i.isPrimary) ?? product.images?.[0]

  const related = await getRelatedProducts(product.category.id, brandKey, slug)

  // Google'da fiyat/stok zengin sonucu için yapılandırılmış veri
  const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description || product.name,
    sku: product.sku || undefined,
    brand: { '@type': 'Brand', name: product.productBrand || cfg.name },
    category: product.category.name,
    ...(primaryImage ? { image: [primaryImage] } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TRY',
      price: (product.salePrice ?? product.price).toFixed(2),
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Bayırlıoğlu Grup' },
    },
  }

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
    />
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="container-main">
          <nav className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
            <Link href={`/${brandKey}`} className="hover:text-gray-900">
              {cfg.name}
            </Link>
            <span>/</span>
            <Link href={`/${brandKey}/urunler`} className="hover:text-gray-900">
              Ürünler
            </Link>
            <span>/</span>
            <Link
              href={`/${brandKey}/urunler?kategori=${product.category.slug}`}
              className="hover:text-gray-900"
            >
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-10">
        {/* ── Ürün Ana Bölüm ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Görsel */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center min-h-72 md:min-h-[480px] relative overflow-hidden">
              <ProductImage
                src={primaryImg?.url ?? ''}
                alt={primaryImg?.alt || product.name}
                fallback={product.category.icon || '📦'}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {discount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                  -%{discount}
                </div>
              )}
              {product.isFeatured && !discount && (
                <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full z-10 ${badgeBg}`}>
                  Öne Çıkan
                </div>
              )}
            </div>

            {/* Bilgi */}
            <div className="p-4 sm:p-8 flex flex-col">
              <p className={`text-sm font-semibold uppercase tracking-wide ${accentText} mb-2`}>
                {product.category.name}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-1">
                {product.name}
              </h1>

              {/* Değerlendirme — gerçek yorum sistemi kurulana kadar gizli */}
              {shouldShowRating(product.reviewCount) && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.rating} ({product.reviewCount} değerlendirme)
                  </span>
                </div>
              )}

              {/* Fiyat */}
              <div className="flex items-end gap-3 mb-6 pb-6 border-b border-gray-100">
                <p className={`text-4xl font-black ${accentText}`}>
                  {displayPrice.toLocaleString('tr-TR')} ₺
                </p>
                {product.salePrice && (
                  <p className="text-gray-400 text-lg line-through mb-1">
                    {product.price.toLocaleString('tr-TR')} ₺
                  </p>
                )}
              </div>

              {/* Kısa Açıklama */}
              <p className="text-gray-600 leading-relaxed mb-6">
                {product.shortDescription}
              </p>

              {/* Teknik Özellikler (özet) */}
              {product.specs && product.specs.length > 0 && (
                <div className="mb-6 space-y-2">
                  {product.specs.slice(0, 4).map((s) => (
                    <div key={s.name} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500">{s.name}</span>
                      <span className="font-semibold text-gray-900">
                        {s.value}{s.unit ? ` ${s.unit}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* SKU & Stok */}
              <div className="flex items-center justify-between mb-6 text-sm">
                <span className="text-gray-400">SKU: {product.sku}</span>
                <span className={`flex items-center gap-1.5 font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                  {product.stock > 10
                    ? `Stokta (${product.stock} ${product.unit})`
                    : product.stock > 0
                      ? `Son ${product.stock} ${product.unit}!`
                      : 'Stok tükendi'}
                </span>
              </div>

              {/* CTA Butonları */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <AddToCartButton
                  product={product}
                  disabled={product.stock === 0}
                  className={`flex-1 ${primaryBtn} text-white py-3.5 rounded-xl font-bold transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                <a
                  href={`https://wa.me/${cfg.whatsapp.phone}?text=${encodeURIComponent(`${cfg.whatsapp.message} Ürün: ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1aad50] text-white py-3.5 px-5 rounded-xl font-bold transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>

              {/* Güvenceler */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
                {[
                  { icon: '🚚', text: '2-5 İş Günü Teslimat' },
                  { icon: '🔄', text: '14 Gün İade' },
                  { icon: '🔒', text: 'Güvenli Ödeme' },
                ].map((item) => (
                  <div key={item.text} className="text-center text-xs text-gray-500">
                    <div className="text-xl mb-1">{item.icon}</div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Detaylı Açıklama ── */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-4 sm:p-8">
          <h2 className="text-lg font-black text-gray-900 mb-4">Ürün Detayları</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {product.specs && product.specs.length > 0 && (
            <>
              <h3 className="text-base font-bold text-gray-900 mb-3">Teknik Özellikler</h3>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {product.specs.map((s, i) => (
                  <div
                    key={s.name}
                    className={`flex justify-between px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <span className="text-gray-500">{s.name}</span>
                    <span className="font-semibold text-gray-900">
                      {s.value}{s.unit ? ` ${s.unit}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── İlgili Ürünler ── */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-black text-gray-900 mb-6">Benzer Ürünler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${brandKey}/urunler/${p.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl relative overflow-hidden">
                    <ProductImage
                      src={p.images?.[0]?.url ?? ''}
                      alt={p.images?.[0]?.alt || p.name}
                      fallback={p.category.icon || '📦'}
                      fill
                      className="object-contain p-3"
                      sizes="200px"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-900 text-xs line-clamp-2 mb-1">{p.name}</p>
                    <p className={`font-black text-sm ${accentText}`}>
                      {(p.salePrice ?? p.price).toLocaleString('tr-TR')} ₺
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
