'use client'

import { useState, useMemo } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BRANDS } from '@/lib/constants'
import { MOCK_PRODUCTS, MOCK_CATEGORIES_TARIM, MOCK_CATEGORIES_ALBSU } from '@/data/mock'
import { useCartStore } from '@/store/cartStore'
import type { BrandKey } from '@/lib/types'
import { toast } from 'react-hot-toast'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Öne Çıkanlar' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'newest', label: 'En Yeniler' },
]

export default function UrunlerContent() {
  const params = useParams()
  const brandKey = params.brand as BrandKey
  const searchParams = useSearchParams()
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)

  const isAlbSu = brandKey === 'alb-su-aritma'
  const cfg = BRANDS[brandKey] ?? BRANDS['alb-tarim']
  const categories = isAlbSu ? MOCK_CATEGORIES_ALBSU : MOCK_CATEGORIES_TARIM

  const activeCategory = searchParams.get('kategori') ?? ''
  const searchQuery = searchParams.get('arama') ?? ''
  const [sort, setSort] = useState('featured')

  const primaryColor = isAlbSu ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
  const accentText = isAlbSu ? 'text-blue-600' : 'text-green-600'
  const tagText = isAlbSu ? 'text-blue-500' : 'text-green-500'

  const filtered = useMemo(() => {
    let list = MOCK_PRODUCTS.filter((p) => p.brand === brandKey)

    if (activeCategory) {
      list = list.filter((p) => p.category.slug === activeCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q)
      )
    }

    switch (sort) {
      case 'price-asc': return [...list].sort((a, b) => a.price - b.price)
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price)
      case 'newest': return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      default: return [...list].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }
  }, [brandKey, activeCategory, searchQuery, sort])

  const setCategory = (slug: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (slug) sp.set('kategori', slug)
    else sp.delete('kategori')
    router.push(`?${sp.toString()}`)
  }

  const handleAddToCart = (product: (typeof MOCK_PRODUCTS)[0]) => {
    addItem(product, 1)
    toast.success(`${product.name} sepete eklendi`)
  }

  const discount = (product: (typeof MOCK_PRODUCTS)[0]) =>
    product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb + başlık */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container-main">
          <nav className="text-sm text-gray-500 mb-3">
            <Link href={`/${brandKey}`} className="hover:text-gray-900 transition-colors">
              {cfg.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Ürünler</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            {cfg.name} Ürünleri
          </h1>
          <p className="text-gray-500 mt-1">{filtered.length} ürün listeleniyor</p>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar: Kategoriler ── */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Kategoriler</h3>
              <button
                onClick={() => setCategory('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
                  !activeCategory ? `${primaryColor} text-white font-semibold` : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tüm Ürünler
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between mb-1 ${
                    activeCategory === cat.slug
                      ? `${primaryColor} text-white font-semibold`
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </span>
                  <span className={`text-xs ${activeCategory === cat.slug ? 'text-white/70' : 'text-gray-400'}`}>
                    {cat.productCount}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* ── Ana İçerik ── */}
          <div className="flex-1">
            {/* Sıralama */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {activeCategory && (
                  <span className={`font-semibold ${accentText}`}>
                    {categories.find((c) => c.slug === activeCategory)?.name} •{' '}
                  </span>
                )}
                {filtered.length} ürün
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-gray-500 font-medium">Bu kategoride ürün bulunamadı</p>
                <button onClick={() => setCategory('')} className={`mt-4 ${accentText} underline text-sm`}>
                  Tüm ürünleri gör
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((product) => {
                  const disc = discount(product)
                  const displayPrice = product.salePrice ?? product.price
                  const primaryImg = product.images?.find((i) => i.isPrimary)?.url ?? ''
                  return (
                    <div
                      key={product.slug}
                      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
                    >
                      <Link href={`/${brandKey}/urunler/${product.slug}`}>
                        {/* GÖRSEL: primaryImg — placeholder gösterim */}
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-5xl relative">
                          {product.category.icon || '📦'}
                          {disc && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              -%{disc}
                            </span>
                          )}
                          {product.isFeatured && !disc && (
                            <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${isAlbSu ? 'bg-blue-600' : 'bg-green-600'}`}>
                              Öne Çıkan
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="p-4 flex flex-col flex-1">
                        <p className={`text-[10px] font-semibold uppercase tracking-wide ${tagText} mb-1`}>
                          {product.category.name}
                        </p>
                        <Link href={`/${brandKey}/urunler/${product.slug}`}>
                          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-gray-700 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="mt-auto">
                          <div className="flex items-end gap-2 mb-3">
                            <p className={`font-black text-lg ${accentText}`}>
                              {displayPrice.toLocaleString('tr-TR')} ₺
                            </p>
                            {product.salePrice && (
                              <p className="text-gray-400 text-xs line-through mb-0.5">
                                {product.price.toLocaleString('tr-TR')} ₺
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`w-full ${primaryColor} text-white text-sm py-2 rounded-xl font-semibold transition-colors`}
                          >
                            Sepete Ekle
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

