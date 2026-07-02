import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MOCK_PRODUCTS } from '@/data/mock'
import { BRAND, ACTIVE_BRAND_KEY, SITE_CONFIG } from '@/lib/constants'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import Breadcrumb from '@/components/ui/Breadcrumb'
import StarRating from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'
import ProductCard from '@/components/ui/ProductCard'
import ProductGallery from './ProductGallery'
import ProductActions from './ProductActions'

// ─── Metadata ─────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug)

  if (!product) {
    return { title: 'Ürün Bulunamadı' }
  }

  const currentPrice = product.salePrice ?? product.price

  return {
    title: `${product.name} | ${BRAND.name}`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | ${BRAND.name}`,
      description: product.shortDescription,
      images: product.images[0]
        ? [
            {
              url: product.images[0].url,
              alt: product.images[0].alt,
            },
          ]
        : [],
      type: 'website',
      siteName: BRAND.name,
      locale: 'tr_TR',
    },
    other: {
      'product:price:amount': String(currentPrice),
      'product:price:currency': 'TRY',
    },
  }
}

// ─── Sayfa Bileşeni (Server Component) ────────────────────────────────────────

export default async function UrunDetayPage({ params }: PageProps) {
  const { slug } = await params
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug && p.isActive)

  if (!product) {
    notFound()
  }

  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price
  const discountPercent = hasDiscount
    ? calculateDiscount(product.price, product.salePrice!)
    : 0
  const currentPrice = product.salePrice ?? product.price

  // WhatsApp sipariş linki
  const whatsappMessage = encodeURIComponent(
    `Merhaba! "${product.name}" ürünü hakkında bilgi almak istiyorum. (SKU: ${product.sku})`
  )
  const whatsappUrl = `https://wa.me/${BRAND.whatsapp.phone}?text=${whatsappMessage}`

  // İlgili ürünler: aynı kategori, farklı ürün, aynı marka
  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) =>
      p.category.slug === product.category.slug &&
      p.id !== product.id &&
      p.brand === ACTIVE_BRAND_KEY &&
      p.isActive
  ).slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* ── Breadcrumb ────────────────────────────────────────────────── */}
        <Breadcrumb
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Ürünler', href: '/urunler' },
            {
              label: product.category.name,
              href: `/urunler?kategori=${product.category.slug}`,
            },
            { label: product.name },
          ]}
        />

        {/* ── Ürün Detay Kartı ──────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm mt-6 p-6 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Sol: Görsel Galerisi (Client Component) */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Sağ: Ürün Bilgileri */}
            <div className="flex flex-col gap-5">
              {/* Meta bilgi satırı */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                <span>{product.category.name}</span>
                <span>·</span>
                <span>SKU: {product.sku}</span>
                {product.tags && product.tags.length > 0 && (
                  <>
                    <span>·</span>
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs',
                          BRAND.colors.primaryLight,
                          BRAND.colors.primaryText
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </>
                )}
              </div>

              {/* Ürün adı */}
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <StarRating
                rating={product.rating}
                reviewCount={product.reviewCount}
                showValue
                size="md"
              />

              {/* Kısa açıklama */}
              <p className="text-gray-600 leading-relaxed text-sm">
                {product.shortDescription}
              </p>

              {/* Fiyat Bloğu */}
              <div className={cn('rounded-2xl p-4', BRAND.colors.primaryLight)}>
                <div className="flex items-end gap-3 flex-wrap">
                  <span className={cn('text-3xl font-black', BRAND.colors.primaryText)}>
                    {formatPrice(currentPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <Badge variant="error" size="md">
                      %{discountPercent} İndirim
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  KDV dahil &nbsp;·&nbsp; Birim: {product.unit}
                </p>
              </div>

              {/* Stok Durumu */}
              <div className="flex items-center gap-2">
                {product.stock === 0 ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                    <Badge variant="error" size="sm">Tükendi</Badge>
                  </>
                ) : product.stock <= 5 ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 flex-shrink-0" />
                    <Badge variant="warning" size="sm">Son {product.stock} adet</Badge>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                    <Badge variant="success" size="sm">Stokta Var</Badge>
                  </>
                )}
              </div>

              {/* Etkileşimli Miktar Seçici + Sepet/Favori (Client Component) */}
              <ProductActions product={product} whatsappUrl={whatsappUrl} />

              {/* Kargo & Garanti Bilgileri */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { icon: '🚚', title: 'Hızlı Teslimat', desc: '1-3 iş günü' },
                  { icon: '↩️', title: 'İade Garantisi', desc: '30 gün iade hakkı' },
                  { icon: '🔒', title: 'Güvenli Ödeme', desc: 'SSL korumalı' },
                  { icon: '📞', title: 'Müşteri Desteği', desc: SITE_CONFIG.workingHours },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-2 bg-gray-50 rounded-xl p-3"
                  >
                    <span className="text-lg flex-shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sekmeler: Açıklama / Özellikler / Yorumlar ────────────────── */}
        <ProductTabs product={product} />

        {/* ── İlgili Ürünler ────────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-black text-gray-900 mb-6">İlgili Ürünler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// ─── Sekmeler (Server Component — statik HTML, hiçbir etkileşim yok) ─────────

import type { Product } from '@/lib/types'

function ProductTabs({ product }: { product: Product }) {
  return (
    <div className="mt-8 bg-white rounded-3xl shadow-sm overflow-hidden">
      {/* Tab header — CSS tabanlı (JS gerektirmiyor, next/navigation ile URL hash de kullanılabilir) */}
      {/* Burada basit server-side render: hepsini göster, CSS ile ayrı bölümler */}
      <div className="border-b border-gray-100">
        <div className="flex overflow-x-auto">
          {[
            { id: 'aciklama', label: 'Açıklama' },
            { id: 'ozellikler', label: 'Özellikler' },
            { id: 'yorumlar', label: `Yorumlar (${product.reviewCount})` },
          ].map((tab, i) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className={cn(
                'px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors',
                i === 0
                  ? cn(BRAND.colors.primaryText, 'border-b-2', BRAND.colors.primaryBorder)
                  : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent'
              )}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      <div className="p-6 lg:p-10 space-y-10">
        {/* Açıklama */}
        <section id="aciklama" aria-label="Ürün Açıklaması">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Açıklama</h2>
          <div className="prose prose-sm prose-gray max-w-none text-gray-600 leading-relaxed">
            {product.description}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Teknik Özellikler */}
        <section id="ozellikler" aria-label="Teknik Özellikler">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Teknik Özellikler</h2>
          {product.specs.length > 0 ? (
            <div className="overflow-x-auto overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <tbody>
                  {product.specs.map((spec, i) => (
                    <tr
                      key={`${spec.name}-${i}`}
                      className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-5 py-3.5 font-medium text-gray-700 w-2/5 border-r border-gray-100">
                        {spec.name}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {spec.value}
                        {spec.unit ? ` ${spec.unit}` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Teknik özellik bilgisi bulunmamaktadır.</p>
          )}
        </section>

        <hr className="border-gray-100" />

        {/* Yorumlar */}
        <section id="yorumlar" aria-label="Müşteri Yorumları">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Yorumlar ({product.reviewCount})
            </h2>
          </div>

          {/* Puan Özeti */}
          <div className="flex items-center gap-6 bg-gray-50 rounded-2xl p-5 mb-6">
            <div className="text-center">
              <p className={cn('text-5xl font-black', BRAND.colors.primaryText)}>
                {product.rating.toFixed(1)}
              </p>
              <StarRating rating={product.rating} size="sm" />
              <p className="text-xs text-gray-400 mt-1">{product.reviewCount} yorum</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{star}</span>
                  <svg
                    className="w-3.5 h-3.5 fill-yellow-400 flex-shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-yellow-400 h-1.5 rounded-full"
                      style={{
                        width: star === Math.round(product.rating) ? '70%' : `${Math.max(5, 30 - (Math.abs(star - product.rating) * 15))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yorumlar yakında */}
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3" aria-hidden="true">⭐</div>
            <p className="font-medium">Yorumlar yakında eklenecek</p>
            <p className="text-sm mt-1">Bu ürün için henüz yorum bulunmuyor.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
