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
  // kullanim → L0 (kök kategori slug'ı: alb-tarim-urunleri | ithal-urunler)
  // marka    → L1 (sadece İthal modunda: marka slug'ı)
  // kategori → ürün tipi slug'ı (ALB'de L1, İthal'de L2)
  const activeKullanim = searchParams.get('kullanim') ?? ''
  const activeMarka    = searchParams.get('marka')    ?? ''
  const activeCategory = searchParams.get('kategori') ?? ''
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
  //   ALB Tarım → ürün tipleri
  //   İthal Ürünler → markalar
  const level1Categories = useMemo(
    () =>
      initialCategories.filter((c) => {
        if (c.parentId == null) return false
        return catById.get(c.parentId)?.parentId == null
      }),
    [initialCategories, catById],
  )

  // L2: L1 kategorilerin doğrudan çocukları
  //   İthal marka → ürün tipleri
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

  // Aktif kök kategori (kullanim param'dan)
  const activeRootCat = useMemo(
    () => rootCategories.find((c) => c.slug === activeKullanim) ?? null,
    [rootCategories, activeKullanim],
  )

  // Aktif kök altındaki L1 kategoriler
  const activeL1Cats = useMemo(
    () => (activeRootCat ? level1Categories.filter((c) => c.parentId === activeRootCat.id) : []),
    [activeRootCat, level1Categories],
  )

  // İthal modu mu?
  const isIthal = activeRootCat?.slug === 'ithal-urunler'

  // Seçili marka kategorisi (sadece İthal modunda)
  const activeMarkaCat = useMemo(
    () => (isIthal && activeMarka ? activeL1Cats.find((c) => c.slug === activeMarka) ?? null : null),
    [isIthal, activeMarka, activeL1Cats],
  )

  // Seçili marka altındaki L2 kategoriler (ürün tipleri)
  const activeL2Cats = useMemo(
    () => (activeMarkaCat ? level2Categories.filter((c) => c.parentId === activeMarkaCat.id) : []),
    [activeMarkaCat, level2Categories],
  )

  // ── Ürün filtreleme ───────────────────────────────────────────────────────

  // Bir ürünün kategorisinin belirli bir atadan gelip gelmediğini kontrol eder
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

    // 1. Kök kategori filtresi (alb-tarim-urunleri | ithal-urunler)
    if (activeKullanim && activeRootCat) {
      list = list.filter((p) => isInAncestor(p.category.slug, activeRootCat.id))
    }

    // 2. Marka filtresi (sadece İthal modunda)
    if (isIthal && activeMarka && activeMarkaCat) {
      list = list.filter((p) => isInAncestor(p.category.slug, activeMarkaCat.id))
    }

    // 3. Ürün tipi filtresi (kategori slug eşleşmesi)
    if (activeCategory) {
      list = list.filter((p) => p.category.slug === activeCategory)
    }

    // 4. Arama
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q),
      )
    }

    // 5. Sıralama
    switch (sort) {
      case 'price-asc':  return [...list].sort((a, b) => a.price - b.price)
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price)
      case 'newest':     return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      default:           return [...list].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProducts, initialCategories, catBySlug, catById, activeKullanim, activeRootCat?.id, isIthal, activeMarka, activeMarkaCat?.id, activeCategory, searchQuery, sort])

  // ── URL yardımcıları ──────────────────────────────────────────────────────

  // Kök kategori değiştir → diğer tüm filtreleri sıfırla
  const setKullanim = (slug: string) => {
    const sp = new URLSearchParams()
    if (slug) sp.set('kullanim', slug)
    router.push(`?${sp.toString()}`)
  }

  // Marka seç (İthal modunda) → ürün tipi filtresini sıfırla
  const setMarkaSlug = (slug: string) => {
    const sp = new URLSearchParams()
    sp.set('kullanim', activeKullanim)
    if (slug) sp.set('marka', slug)
    router.push(`?${sp.toString()}`)
  }

  // Ürün tipi seç
  const setCategory = (slug: string) => {
    const sp = new URLSearchParams()
    sp.set('kullanim', activeKullanim)
    if (isIthal && activeMarka) sp.set('marka', activeMarka)
    if (slug) sp.set('kategori', slug)
    router.push(`?${sp.toString()}`)
  }

  // Ürün tipi filtresini temizle (markayı koru)
  const clearCategory = () => {
    const sp = new URLSearchParams()
    sp.set('kullanim', activeKullanim)
    if (isIthal && activeMarka) sp.set('marka', activeMarka)
    router.push(`?${sp.toString()}`)
  }

  // Tüm filtreleri temizle
  const clearAll = () => router.push('?')

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)
    toast.success(`${product.name} sepete eklendi`)
  }

  const discount = (product: Product) =>
    product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : null

  // L2 "Tümü" aktif mi?
  // ALB modunda: ürün tipi seçili değil
  // İthal modunda: marka seçili değil
  const l2AllActive = isIthal ? !activeMarka : !activeCategory

  // Breadcrumb etiketi
  const activeCategoryLabel = useMemo(() => {
    if (isIthal) {
      if (activeMarkaCat && activeCategory) {
        const typeCat = activeL2Cats.find((c) => c.slug === activeCategory)
        if (typeCat) return `${activeMarkaCat.name} › ${typeCat.name}`
        return activeMarkaCat.name
      }
      if (activeMarkaCat) return activeMarkaCat.name
      if (activeRootCat) return activeRootCat.name
      return null
    }
    // ALB Tarım
    if (activeCategory) return activeL1Cats.find((c) => c.slug === activeCategory)?.name ?? null
    if (activeRootCat) return activeRootCat.name
    return null
  }, [isIthal, activeMarkaCat, activeCategory, activeL2Cats, activeRootCat, activeL1Cats])

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
                            isActive
                              ? `${accentBg} text-white`
                              : 'bg-gray-100 text-gray-500',
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

      {/* ─── L1: Marka/Ürün-tipi pill şeridi ────────────────────────────── */}
      {/* ALB Tarım → ürün tipleri | İthal Ürünler → markalar */}
      {hasHierarchy && activeRootCat && activeL1Cats.length > 0 && (
        <div className={`${accentLight} border-b border-gray-100`}>
          <div className="container-main">

            {/* ── Mobil: Tümü + dropdown ── */}
            <div className="flex md:hidden items-center gap-2 py-3">
              <button
                onClick={() => (isIthal ? setKullanim(activeKullanim) : clearCategory())}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  l2AllActive ? pillActive : pillInactive
                }`}
              >
                Tümü
              </button>
              <div className="relative">
                <select
                  value={isIthal ? activeMarka : activeCategory}
                  onChange={(e) => {
                    const val = e.target.value
                    if (isIthal) {
                      val ? setMarkaSlug(val) : setKullanim(activeKullanim)
                    } else {
                      val ? setCategory(val) : clearCategory()
                    }
                  }}
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer"
                >
                  <option value="">{isIthal ? 'Marka Seç' : 'Kategori Seç'}</option>
                  {activeL1Cats.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
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
                onClick={() => (isIthal ? setKullanim(activeKullanim) : clearCategory())}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  l2AllActive ? pillActive : pillInactive
                }`}
              >
                Tümü
              </button>
              {activeL1Cats.map((cat) => {
                const isActive = isIthal ? activeMarka === cat.slug : activeCategory === cat.slug
                return (
                  <button
                    key={cat.slug}
                    onClick={() => (isIthal ? setMarkaSlug(cat.slug) : setCategory(cat.slug))}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                      isActive ? pillActive : pillInactive
                    }`}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{cat.name}</span>
                  </button>
                )
              })}
            </div>

          </div>
        </div>
      )}

      {/* ─── L2: Ürün tipi pill şeridi (sadece İthal + marka seçiliyken) ── */}
      {isIthal && activeMarkaCat && activeL2Cats.length > 0 && (
        <div className="bg-white/80 border-b border-gray-100">
          <div className="container-main">

            {/* ── Mobil ── */}
            <div className="flex md:hidden items-center gap-2 py-2.5">
              <button
                onClick={clearCategory}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  !activeCategory ? pillActive : pillInactive
                }`}
              >
                Tümü
              </button>
              <div className="relative">
                <select
                  value={activeCategory}
                  onChange={(e) => (e.target.value ? setCategory(e.target.value) : clearCategory())}
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer"
                >
                  <option value="">Kategori Seç</option>
                  {activeL2Cats.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
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

            {/* ── Desktop ── */}
            <div className="hidden md:flex flex-wrap items-center gap-2 py-2.5">
              <button
                onClick={clearCategory}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  !activeCategory ? pillActive : pillInactive
                }`}
              >
                Tümü
              </button>
              {activeL2Cats.map((cat) => {
                const isActive = activeCategory === cat.slug
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setCategory(cat.slug)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                      isActive ? pillActive : pillInactive
                    }`}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{cat.name}</span>
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

        {/* Flat düzen (hiyerarşi yok — ALB Su vb.) */}
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
                    onClick={() => setCategory(cat.slug)}
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
                products={filtered}
                brandKey={brandKey}
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

        {/* Hiyerarşik düzen (ALB Tarım vb.) */}
        {hasHierarchy && (
          <ProductGrid
            products={filtered}
            brandKey={brandKey}
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

// ─── Ürün ızgarası alt bileşeni ───────────────────────────────────────────────

interface GridProps {
  products: Product[]
  brandKey: BrandKey
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
      {products.map((product) => {
        const disc = discount(product)
        const displayPrice = product.salePrice ?? product.price
        const primaryImg = product.images?.find((i) => i.isPrimary)?.url ?? ''

        return (
          <div
            key={product.slug}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
          >
            {/* Görsel */}
            <Link href={`/${brandKey}/urunler/${product.slug}`}>
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                <ProductImage
                  src={primaryImg}
                  alt={product.name}
                  fallback={product.category.icon || '📦'}
                  fill
                  className="object-contain p-5 group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                {disc && (
                  <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                    -%{disc}
                  </span>
                )}
                {product.isFeatured && !disc && (
                  <span
                    className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white z-10 shadow-sm ${accentBg}`}
                  >
                    ⭐ Öne Çıkan
                  </span>
                )}
              </div>
            </Link>

            {/* İçerik */}
            <div className="p-4 flex flex-col flex-1">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${accentTag} mb-1 truncate`}>
                {product.category.name}
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
                  className={`w-full ${accentBg} ${accentHover} text-white text-sm py-2.5 rounded-xl font-semibold transition-colors`}
                >
                  Sepete Ekle
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
