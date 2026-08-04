'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ProductImage from '@/components/product/ProductImage'
import { BRANDS } from '@/lib/constants'
import { useCartStore } from '@/store/cartStore'
import type { BrandKey, Product, Category } from '@/lib/types'
import { toast } from 'react-hot-toast'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Öne Çıkanlar' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'newest', label: 'En Yeniler' },
]

// Pill için ortak tip (ALB L1 ve İthal L2 aynı şekle gelir)
type TypePill = { name: string; icon: string | null; sortOrder: number }

interface Props {
  brandKey: BrandKey
  initialProducts: Product[]
  initialCategories: Category[]
}

export default function UrunlerContent({ brandKey, initialProducts, initialCategories }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)

  const isAlbSu = brandKey === 'alb-su-aritma'
  const cfg = BRANDS[brandKey] ?? BRANDS['alb-tarim']

  // ── URL parametreleri ─────────────────────────────────────────────────────
  const activeKullanim = searchParams.get('kullanim') ?? ''
  const activeCategory = searchParams.get('kategori') ?? ''   // geriye dönük uyumluluk
  const activeType     = searchParams.get('type')     ?? ''   // ürün tipi adı (tüm modlarda)
  const searchQuery    = searchParams.get('arama')    ?? ''
  const [sort, setSort] = useState('featured')

  // ── Renk sistemi ─────────────────────────────────────────────────────────
  const accentText   = isAlbSu ? 'text-blue-600'    : 'text-green-700'
  const accentBg     = isAlbSu ? 'bg-blue-600'       : 'bg-green-600'
  const accentHover  = isAlbSu ? 'hover:bg-blue-500' : 'hover:bg-green-500'
  const accentBorder = isAlbSu ? 'border-b-blue-600' : 'border-b-green-600'
  const accentLight  = isAlbSu ? 'bg-blue-50/60'     : 'bg-green-50/60'
  const accentTag    = isAlbSu ? 'text-blue-500'     : 'text-green-600'
  const pillActive   = isAlbSu
    ? 'bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-sm'
    : 'bg-green-600 hover:bg-green-500 text-white border-transparent shadow-sm'
  const pillInactive = 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'

  // ── Kategori haritaları ───────────────────────────────────────────────────
  const catById = useMemo(
    () => new Map(initialCategories.map((c) => [c.id, c])),
    [initialCategories],
  )
  const catBySlug = useMemo(
    () => new Map(initialCategories.map((c) => [c.slug, c])),
    [initialCategories],
  )

  // L0: kök kategoriler (parentId = null)
  const rootCategories = useMemo(
    () => initialCategories.filter((c) => c.parentId == null),
    [initialCategories],
  )

  // L1: kök kategorilerin doğrudan çocukları
  const level1Categories = useMemo(
    () =>
      initialCategories.filter((c) => {
        if (c.parentId == null) return false
        return catById.get(c.parentId)?.parentId == null
      }),
    [initialCategories, catById],
  )

  // L2: L1 kategorilerin doğrudan çocukları
  const level2Categories = useMemo(
    () =>
      initialCategories.filter((c) => {
        if (c.parentId == null) return false
        const parent = catById.get(c.parentId)
        if (!parent || parent.parentId == null) return false
        return catById.get(parent.parentId)?.parentId == null
      }),
    [initialCategories, catById],
  )

  const hasHierarchy = rootCategories.length > 0

  // Aktif kök kategori
  const activeRootCat = useMemo(
    () => rootCategories.find((c) => c.slug === activeKullanim) ?? null,
    [rootCategories, activeKullanim],
  )

  // İthal modu mu?
  const isIthal = activeRootCat?.slug === 'ithal-urunler'

  // ── Pill şeridi ───────────────────────────────────────────────────────────
  // ALB ürün tipi pill'leri — activeRootCat'tan bağımsız, ALB kök slug'ından hesaplanır
  const albTypePills = useMemo((): TypePill[] => {
    const albRoot = rootCategories.find((c) => c.slug === 'alb-tarim-urunleri')
    if (!albRoot) return []
    return level1Categories
      .filter((c) => c.parentId === albRoot.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ name: c.name, icon: c.icon ?? null, sortOrder: c.sortOrder }))
  }, [rootCategories, level1Categories])

  // İthal ürün tipi pill'leri — L2 kategorilerinden isim bazlı tekilleştirme
  const ithalTypePills = useMemo((): TypePill[] => {
    const ithalRoot = rootCategories.find((c) => c.slug === 'ithal-urunler')
    if (!ithalRoot) return []
    const ithalId = ithalRoot.id
    const seen = new Map<string, TypePill>()

    level2Categories
      .filter((c) => {
        if (c.parentId == null) return false
        const parent = catById.get(c.parentId) // brand L1
        return parent?.parentId === ithalId
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((c) => {
        if (!seen.has(c.name)) {
          seen.set(c.name, { name: c.name, icon: c.icon ?? null, sortOrder: c.sortOrder })
        }
      })

    return Array.from(seen.values()).sort((a, b) => a.sortOrder - b.sortOrder)
  }, [rootCategories, level2Categories, catById])

  // Aktif pill şeridi: İthal → ithalTypePills, diğer tüm modlar (Tümü + ALB) → albTypePills
  const activePills = isIthal ? ithalTypePills : albTypePills

  // ── Ürün kartı marka etiketi ──────────────────────────────────────────────
  const getProductBrandLabel = (productCatSlug: string): string => {
    const cat = catBySlug.get(productCatSlug)
    if (!cat) return ''
    if (cat.parentId == null) return cat.name
    const parent = catById.get(cat.parentId)
    if (!parent) return cat.name
    if (parent.parentId == null) return 'ALB Tarım'
    return parent.name
  }

  const productBrandLabels = useMemo(() => {
    const map = new Map<string, string>()
    initialProducts.forEach((p) => {
      const label = p.productBrand?.trim() || getProductBrandLabel(p.category.slug)
      map.set(p.slug, label)
    })
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProducts, catBySlug, catById])

  // ── Ürün filtreleme ───────────────────────────────────────────────────────

  const isInAncestor = (productCatSlug: string, ancestorId: number): boolean => {
    let cat = catBySlug.get(productCatSlug)
    while (cat) {
      if (cat.id === ancestorId) return true
      cat = cat.parentId != null ? catById.get(cat.parentId) : undefined
    }
    return false
  }

  const filtered = useMemo(() => {
    let list = [...initialProducts]

    // 1. Kök kategori filtresi (Tümü modunda atlanır)
    if (activeKullanim && activeRootCat) {
      list = list.filter((p) => isInAncestor(p.category.slug, activeRootCat.id))
    }

    // 2. Ürün tipi filtresi — isim bazlı, tüm modlarda çalışır (Tümü dahil)
    if (activeType) {
      list = list.filter((p) => {
        const cat = catBySlug.get(p.category.slug)
        return cat?.name === activeType
      })
    } else if (!isIthal && activeCategory) {
      // Geriye dönük uyumluluk: eski slug bazlı ALB filtresi
      list = list.filter((p) => p.category.slug === activeCategory)
    }

    // 3. Arama
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q),
      )
    }

    // 4. Sıralama
    switch (sort) {
      case 'price-asc':  return [...list].sort((a, b) => a.price - b.price)
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price)
      case 'newest':     return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      default:           return [...list].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProducts, catBySlug, catById, activeKullanim, activeRootCat?.id, isIthal, activeType, activeCategory, searchQuery, sort])

  // ── URL yardımcıları ──────────────────────────────────────────────────────

  const setKullanim = (slug: string) => {
    const sp = new URLSearchParams()
    if (slug) sp.set('kullanim', slug)
    router.push(`?${sp.toString()}`)
  }

  // Ürün tipi filtresi: tüm modlarda çalışır, mevcut kullanim değerini korur
  const setTypeFilter = (typeName: string) => {
    const sp = new URLSearchParams()
    if (activeKullanim) sp.set('kullanim', activeKullanim)
    if (typeName) sp.set('type', typeName)
    router.push(`?${sp.toString()}`)
  }

  // Tip filtresini temizle (kullanim'ı koru)
  const clearTypeFilter = () => {
    const sp = new URLSearchParams()
    if (activeKullanim) sp.set('kullanim', activeKullanim)
    router.push(`?${sp.toString()}`)
  }

  // Tüm filtreleri temizle
  const clearAll = () => router.push('?')

  const handleAddToCart = (product: Product) => {
    // Tükenmiş ürün sepete eklenemez — eskiden kontrol yoktu ve tükenmiş ürün
    // defalarca eklenip ödeme aşamasında sunucu tarafından reddediliyordu.
    if (product.stock === 0) {
      toast.error(`${product.name} şu anda tükendi.`)
      return
    }
    addItem(product, 1)
    toast.success(`${product.name} sepete eklendi`)
  }

  const discount = (product: Product) =>
    product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : null

  // Pill "Tümü" aktif mi?
  const pillAllActive = !activeType && !activeCategory

  // Breadcrumb etiketi
  const activeCategoryLabel = useMemo(() => {
    if (activeType) return activeType
    if (activeCategory) {
      return albTypePills.find((p) => p.name === activeCategory)?.name ?? null
    }
    if (activeRootCat) return activeRootCat.name
    return null
  }, [activeType, activeCategory, activeRootCat, albTypePills])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ─── Başlık + breadcrumb ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="container-main">
          <nav className="text-sm text-gray-400 mb-2 flex items-center gap-1.5">
            <Link href={`/${brandKey}`} className="hover:text-gray-700 transition-colors">
              {cfg.name}
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Ürünler</span>
            {activeCategoryLabel && (
              <>
                <span>/</span>
                <span className={`font-semibold ${accentText}`}>{activeCategoryLabel}</span>
              </>
            )}
          </nav>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              {activeCategoryLabel ?? `${cfg.name} Ürünleri`}
            </h1>
            <p className="text-sm text-gray-400 hidden sm:block shrink-0">
              {filtered.length} ürün
            </p>
          </div>
        </div>
      </div>

      {/* ─── L0: Kök kategori sekme çubuğu ──────────────────────────────── */}
      {hasHierarchy && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-[0_1px_4px_rgba(0,0,0,.06)]">
          <div className="container-main">
            <div
              role="tablist"
              className="flex items-stretch overflow-x-auto scrollbar-hide -mb-px"
            >
              {/* Tümü */}
              <button
                role="tab"
                aria-selected={!activeKullanim}
                onClick={clearAll}
                className={[
                  'flex-shrink-0 px-5 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
                  !activeKullanim
                    ? `${accentText} ${accentBorder}`
                    : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300',
                ].join(' ')}
              >
                Tümü
              </button>

              <span aria-hidden className="self-center text-gray-200 select-none px-1">|</span>

              {rootCategories.map((cat, idx) => {
                const isActive = activeKullanim === cat.slug
                return (
                  <div key={cat.slug} className="flex items-stretch flex-shrink-0">
                    <button
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setKullanim(cat.slug)}
                      className={[
                        'flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
                        isActive
                          ? `${accentText} ${accentBorder}`
                          : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300',
                      ].join(' ')}
                    >
                      {cat.icon && <span>{cat.icon}</span>}
                      <span>{cat.name}</span>
                      {cat.productCount != null && cat.productCount > 0 && (
                        <span
                          className={[
                            'text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none transition-colors',
                            isActive ? `${accentBg} text-white` : 'bg-gray-100 text-gray-500',
                          ].join(' ')}
                        >
                          {cat.productCount}
                        </span>
                      )}
                    </button>
                    {idx < rootCategories.length - 1 && (
                      <span aria-hidden className="self-center text-gray-200 select-none px-1">|</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Ürün tipi pill şeridi — her zaman gösterilir ────────────────── */}
      {hasHierarchy && activePills.length > 0 && (
        <div className={`${accentLight} border-b border-gray-100`}>
          <div className="container-main">

            {/* ── Mobil: Tümü + dropdown ── */}
            <div className="flex md:hidden items-center gap-2 py-3">
              <button
                onClick={clearTypeFilter}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ease-out active:scale-95 ${
                  pillAllActive ? `${pillActive} scale-105 shadow-sm` : `${pillInactive} hover:scale-105`
                }`}
              >
                Tümü
              </button>
              <div className="relative">
                <select
                  value={activeType}
                  onChange={(e) => {
                    const val = e.target.value
                    if (!val) clearTypeFilter()
                    else setTypeFilter(val)
                  }}
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer"
                >
                  <option value="">Kategori Seç</option>
                  {activePills.map((pill) => (
                    <option key={pill.name} value={pill.name}>
                      {pill.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* ── Desktop: sarmalayan pill'ler ── */}
            <div className="hidden md:flex flex-wrap items-center gap-2 py-3">
              <button
                onClick={clearTypeFilter}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ease-out active:scale-95 ${
                  pillAllActive ? `${pillActive} scale-105 shadow-sm` : `${pillInactive} hover:scale-105`
                }`}
              >
                Tümü
              </button>
              {activePills.map((pill) => {
                const isActive = activeType === pill.name
                return (
                  <button
                    key={pill.name}
                    onClick={() => setTypeFilter(pill.name)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ease-out whitespace-nowrap active:scale-95 ${
                      isActive ? `${pillActive} scale-105 shadow-sm` : `${pillInactive} hover:scale-105`
                    }`}
                  >
                    {pill.icon && <span>{pill.icon}</span>}
                    <span>{pill.name}</span>
                  </button>
                )
              })}
            </div>

          </div>
        </div>
      )}

      {/* ─── Ana içerik ──────────────────────────────────────────────────── */}
      <div className="container-main py-8">

        {/* Sıralama + sayım */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {activeCategoryLabel && (
              <span className={`font-semibold ${accentText}`}>{activeCategoryLabel} · </span>
            )}
            {filtered.length} ürün listeleniyor
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

        {/* Flat düzen (hiyerarşi yok) */}
        {!hasHierarchy && (
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-widest">
                  Kategoriler
                </h3>
                <button
                  onClick={clearAll}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
                    !activeCategory
                      ? `${accentBg} ${accentHover} text-white font-semibold`
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tüm Ürünler
                </button>
                {initialCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setTypeFilter(cat.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between mb-1 ${
                      activeCategory === cat.slug
                        ? `${accentBg} ${accentHover} text-white font-semibold`
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {cat.icon && <span>{cat.icon}</span>}
                      <span>{cat.name}</span>
                    </span>
                    {cat.productCount != null && (
                      <span className={`text-xs ${activeCategory === cat.slug ? 'text-white/70' : 'text-gray-400'}`}>
                        {cat.productCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </aside>
            <div className="flex-1">
              <ProductGrid
                key={`${activeKullanim}|${activeCategory}|${activeType}`}
                products={filtered}
                brandKey={brandKey}
                brandLabels={productBrandLabels}
                accentBg={accentBg}
                accentHover={accentHover}
                accentText={accentText}
                accentTag={accentTag}
                discount={discount}
                handleAddToCart={handleAddToCart}
                clearAll={clearAll}
              />
            </div>
          </div>
        )}

        {/* Hiyerarşik düzen */}
        {hasHierarchy && (
          <ProductGrid
            key={`${activeKullanim}|${activeCategory}|${activeType}`}
            products={filtered}
            brandKey={brandKey}
            brandLabels={productBrandLabels}
            accentBg={accentBg}
            accentHover={accentHover}
            accentText={accentText}
            accentTag={accentTag}
            discount={discount}
            handleAddToCart={handleAddToCart}
            clearAll={clearAll}
          />
        )}
      </div>
    </div>
  )
}

// ─── Ürün ızgarası ────────────────────────────────────────────────────────────

interface GridProps {
  products: Product[]
  brandKey: BrandKey
  brandLabels: Map<string, string>
  accentBg: string
  accentHover: string
  accentText: string
  accentTag: string
  discount: (p: Product) => number | null
  handleAddToCart: (p: Product) => void
  clearAll: () => void
}

function ProductGrid({
  products,
  brandKey,
  brandLabels,
  accentBg,
  accentHover,
  accentText,
  accentTag,
  discount,
  handleAddToCart,
  clearAll,
}: GridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-gray-500 font-medium text-lg">Bu kategoride ürün bulunamadı</p>
        <button
          onClick={clearAll}
          className={`mt-5 ${accentText} underline underline-offset-2 text-sm font-medium`}
        >
          Tüm ürünleri gör
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {products.map((product, index) => {
        const disc = discount(product)
        const displayPrice = product.salePrice ?? product.price
        const primaryImg = product.images?.find((i) => i.isPrimary)?.url ?? ''
        const brandLabel = brandLabels.get(product.slug) || product.category.name

        return (
          <div
            key={product.slug}
            style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
            className="anim-fade-up group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 hover:border-gray-200 transition-all duration-300 flex flex-col"
          >
            {/* Görsel */}
            <Link href={`/${brandKey}/urunler/${product.slug}`}>
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                <ProductImage
                  src={primaryImg}
                  alt={product.name}
                  fallback={product.category.icon || '📦'}
                  fill
                  className="object-contain p-5 group-hover:scale-110 group-hover:-rotate-1 transition-transform duration-500 ease-out"
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                {disc && (
                  <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                    -%{disc}
                  </span>
                )}
                {product.isFeatured && !disc && (
                  <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white z-10 shadow-sm ${accentBg}`}>
                    ⭐ Öne Çıkan
                  </span>
                )}
              </div>
            </Link>

            {/* İçerik */}
            <div className="p-4 flex flex-col flex-1">
              {/* Marka adı (yeşil küçük etiket) */}
              <p className={`text-[10px] font-bold uppercase tracking-widest ${accentTag} mb-1 truncate`}>
                {brandLabel}
              </p>
              <Link href={`/${brandKey}/urunler/${product.slug}`}>
                <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-gray-700 transition-colors">
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
                  disabled={product.stock === 0}
                  className={`btn-press w-full ${
                    product.stock === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : `${accentBg} ${accentHover} text-white`
                  } text-sm py-2.5 rounded-xl font-semibold disabled:hover:translate-y-0`}
                >
                  {product.stock === 0 ? 'Tükendi' : 'Sepete Ekle'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
