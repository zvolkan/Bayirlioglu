'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn, formatPrice } from '@/lib/utils'
import { BRAND, ACTIVE_BRAND_KEY } from '@/lib/constants'
import { MOCK_PRODUCTS, MOCK_CATEGORIES_TARIM, MOCK_CATEGORIES_ALBSU } from '@/data/mock'
import type { Product, Category, SortOption } from '@/lib/types'
import ProductCard from '@/components/ui/ProductCard'
import Breadcrumb from '@/components/ui/Breadcrumb'

// ─── Sabit veriler ────────────────────────────────────────────────────────────

const SORT_OPTIONS: { label: string; value: SortOption | '' }[] = [
  { label: 'Önerilen', value: '' },
  { label: 'Fiyat: Düşükten Yükseğe', value: 'price-asc' },
  { label: 'Fiyat: Yüksekten Düşüğe', value: 'price-desc' },
  { label: 'En Yeni', value: 'newest' },
  { label: 'En Çok Satan', value: 'popular' },
]

// ─── Yardımcı fonksiyon: ürünleri sırala ─────────────────────────────────────

function sortProducts(products: Product[], sort: string): Product[] {
  const arr = [...products]
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))
    case 'price-desc':
      return arr.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price))
    case 'newest':
      return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'popular':
      return arr.sort((a, b) => b.reviewCount - a.reviewCount)
    default:
      return arr.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
  }
}

// ─── Filtre paneli (sidebar) ──────────────────────────────────────────────────

interface FilterPanelProps {
  categories: Category[]
  selectedCategories: string[]
  onToggleCategory: (slug: string) => void
  minPrice: string
  maxPrice: string
  onMinPrice: (v: string) => void
  onMaxPrice: (v: string) => void
  inStockOnly: boolean
  onToggleInStock: () => void
  sort: string
  onSort: (v: string) => void
  onReset: () => void
}

function FilterPanel({
  categories,
  selectedCategories,
  onToggleCategory,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  inStockOnly,
  onToggleInStock,
  sort,
  onSort,
  onReset,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Kategoriler */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          Kategoriler
        </h3>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat.id}>
              <label className="flex items-center gap-2.5 cursor-pointer group py-1">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => onToggleCategory(cat.slug)}
                  className={cn(
                    'w-4 h-4 rounded border-gray-300 cursor-pointer',
                    BRAND.colors.ring
                  )}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors flex-1">
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {cat.name}
                </span>
                {cat.productCount !== undefined && (
                  <span className="text-xs text-gray-400">({cat.productCount})</span>
                )}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-gray-100" />

      {/* Fiyat Aralığı */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          Fiyat Aralığı
        </h3>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label htmlFor="min-price" className="text-xs text-gray-500 mb-1 block">
              Min (₺)
            </label>
            <input
              id="min-price"
              type="number"
              min={0}
              placeholder="0"
              value={minPrice}
              onChange={(e) => onMinPrice(e.target.value)}
              className={cn(
                'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900',
                'focus:outline-none focus:ring-2',
                BRAND.colors.ring
              )}
            />
          </div>
          <span className="text-gray-400 mt-5">–</span>
          <div className="flex-1">
            <label htmlFor="max-price" className="text-xs text-gray-500 mb-1 block">
              Maks (₺)
            </label>
            <input
              id="max-price"
              type="number"
              min={0}
              placeholder="∞"
              value={maxPrice}
              onChange={(e) => onMaxPrice(e.target.value)}
              className={cn(
                'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900',
                'focus:outline-none focus:ring-2',
                BRAND.colors.ring
              )}
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Stok Durumu */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          Stok Durumu
        </h3>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={onToggleInStock}
            className={cn('w-4 h-4 rounded border-gray-300 cursor-pointer', BRAND.colors.ring)}
          />
          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
            Yalnızca stokta olanlar
          </span>
        </label>
      </div>

      <hr className="border-gray-100" />

      {/* Sıralama */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          Sıralama
        </h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group py-1">
              <input
                type="radio"
                name="sort"
                checked={sort === opt.value}
                onChange={() => onSort(opt.value)}
                className={cn('w-4 h-4 border-gray-300 cursor-pointer', BRAND.colors.ring)}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Filtreleri Sıfırla */}
      <button
        onClick={onReset}
        className="w-full text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-xl py-2.5 transition-colors hover:border-gray-400"
      >
        Filtreleri Sıfırla
      </button>
    </div>
  )
}

// ─── Ana Sayfa Bileşeni ───────────────────────────────────────────────────────

export default function UrunlerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL'den başlangıç değerlerini oku
  const urlKategori = searchParams.get('kategori') ?? ''

  // Filtre state'leri
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    urlKategori ? [urlKategori] : []
  )
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState('')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Aktif markaya göre kategorileri seç
  const categories: Category[] =
    ACTIVE_BRAND_KEY === 'alb-tarim' ? MOCK_CATEGORIES_TARIM : MOCK_CATEGORIES_ALBSU

  // Sayfa başlığını ayarla
  useEffect(() => {
    document.title = `Ürünler | ${BRAND.name}`
  }, [])

  // URL param değiştiğinde kategori filtresi güncelle
  useEffect(() => {
    if (urlKategori) {
      setSelectedCategories([urlKategori])
    }
  }, [urlKategori])

  // Overlay açıkken scroll'u kilitle
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  // URL'yi güncelle (kategori değiştiğinde)
  const updateUrl = useCallback(
    (cats: string[]) => {
      const params = new URLSearchParams()
      if (cats.length === 1) params.set('kategori', cats[0])
      if (searchQuery) params.set('q', searchQuery)
      const qs = params.toString()
      router.replace(`/urunler${qs ? '?' + qs : ''}`, { scroll: false })
    },
    [router, searchQuery]
  )

  const handleToggleCategory = (slug: string) => {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((s) => s !== slug)
      : [...selectedCategories, slug]
    setSelectedCategories(next)
    updateUrl(next)
  }

  const handleReset = () => {
    setSelectedCategories([])
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
    setSort('')
    setSearchQuery('')
    router.replace('/urunler', { scroll: false })
  }

  // ── Filtreleme mantığı ──────────────────────────────────────────────────────

  const filteredProducts = React.useMemo(() => {
    let list = MOCK_PRODUCTS.filter((p) => p.brand === ACTIVE_BRAND_KEY && p.isActive)

    // Kategori filtresi
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category.slug))
    }

    // Arama
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }

    // Fiyat aralığı
    const min = minPrice !== '' ? Number(minPrice) : null
    const max = maxPrice !== '' ? Number(maxPrice) : null
    if (min !== null) list = list.filter((p) => (p.salePrice ?? p.price) >= min)
    if (max !== null && max > 0) list = list.filter((p) => (p.salePrice ?? p.price) <= max)

    // Stok
    if (inStockOnly) list = list.filter((p) => p.stock > 0)

    return sortProducts(list, sort)
  }, [selectedCategories, searchQuery, minPrice, maxPrice, inStockOnly, sort])

  const activeFilterCount =
    selectedCategories.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (sort ? 1 : 0)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sayfa Başlığı ─────────────────────────────────────────────────── */}
      <div className={cn(BRAND.colors.fallbackGradient, 'py-10 text-white')}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Breadcrumb
            items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Ürünler' }]}
          />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black">Ürünler</h1>
              <p className="text-white/70 mt-1 text-sm">
                {BRAND.name} ürün kataloğunu keşfedin
              </p>
            </div>
            <p className="text-white/60 text-sm">
              {filteredProducts.length} ürün listeleniyor
            </p>
          </div>
        </div>
      </div>

      {/* ── İçerik ────────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        <div className="flex gap-8">
          {/* ── Sol Sidebar (Desktop) ──────────────────────────────────────── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <FilterPanel
                categories={categories}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPrice={setMinPrice}
                onMaxPrice={setMaxPrice}
                inStockOnly={inStockOnly}
                onToggleInStock={() => setInStockOnly((v) => !v)}
                sort={sort}
                onSort={setSort}
                onReset={handleReset}
              />
            </div>
          </aside>

          {/* ── Sağ İçerik ────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Arama Çubuğu + Mobil Filtre Butonu */}
            <div className="flex gap-3 mb-6">
              {/* Arama */}
              <div className="flex-1 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün ara..."
                  className={cn(
                    'w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm',
                    'text-gray-900 placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:border-transparent',
                    BRAND.colors.ring
                  )}
                />
              </div>

              {/* Mobil: Filtreler Butonu */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4h18M7 12h10M11 20h2"
                  />
                </svg>
                Filtreler
                {activeFilterCount > 0 && (
                  <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full text-white', BRAND.colors.primary)}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Ürün sayısı ve aktif filtreler özeti */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{filteredProducts.length}</span> ürün bulundu
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
                >
                  Filtreleri temizle
                </button>
              )}
            </div>

            {/* Ürün Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Boş Durum */
              <div className="bg-white rounded-2xl py-20 px-8 text-center shadow-sm">
                <div className="text-5xl mb-4" aria-hidden="true">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ürün bulunamadı</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                  Seçtiğiniz filtreler veya arama terimiyle eşleşen ürün yok. Farklı bir arama deneyin.
                </p>
                <button
                  onClick={handleReset}
                  className={cn(
                    'inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm',
                    BRAND.colors.accentPrimary
                  )}
                >
                  Tüm Ürünleri Gör
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobil Sidebar Overlay ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            className="fixed inset-y-0 left-0 z-50 w-80 max-w-[90vw] bg-white shadow-2xl flex flex-col lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Filtreler"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">Filtreler</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                aria-label="Filtreleri kapat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* İçerik */}
            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel
                categories={categories}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPrice={setMinPrice}
                onMaxPrice={setMaxPrice}
                inStockOnly={inStockOnly}
                onToggleInStock={() => setInStockOnly((v) => !v)}
                sort={sort}
                onSort={setSort}
                onReset={handleReset}
              />
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100">
              <button
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'w-full py-3 rounded-xl font-semibold text-sm',
                  BRAND.colors.accentPrimary
                )}
              >
                {filteredProducts.length} Ürünü Gör
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
