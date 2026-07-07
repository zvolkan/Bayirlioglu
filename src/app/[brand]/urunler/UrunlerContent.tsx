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

  const activeKullanim = searchParams.get('kullanim') ?? ''   // parent category slug
  const activeCategory = searchParams.get('kategori') ?? ''   // child category slug
  const searchQuery = searchParams.get('arama') ?? ''
  const [sort, setSort] = useState('featured')

  const primaryColor = isAlbSu ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
  const accentText = isAlbSu ? 'text-blue-600' : 'text-green-600'
  const tagText = isAlbSu ? 'text-blue-500' : 'text-green-500'
  const activePillCls = isAlbSu
    ? 'bg-blue-600 text-white shadow-sm'
    : 'bg-green-600 text-white shadow-sm'

  // ── Kategori hiyerarşisi ───────────────────────────────────────────────────
  // Alb Su: parentId null → parent tab, parentId dolu → child (sidebar)
  // ALB Tarım: tüm kategoriler flat (parentId yok)

  const parentCategories = useMemo(
    () => initialCategories.filter((c) => c.parentId == null),
    [initialCategories],
  )

  const childCategories = useMemo(
    () => initialCategories.filter((c) => c.parentId != null),
    [initialCategories],
  )

  const hasHierarchy = isAlbSu && parentCategories.length > 0 && childCategories.length > 0

  // Aktif parent tab nesnesi
  const activeParentCat = useMemo(
    () => (hasHierarchy ? parentCategories.find((c) => c.slug === activeKullanim) ?? null : null),
    [hasHierarchy, parentCategories, activeKullanim],
  )

  // Sidebar'da gösterilecek kategoriler
  const sidebarCategories = useMemo(() => {
    if (hasHierarchy) {
      return activeParentCat
        ? childCategories.filter((c) => c.parentId === activeParentCat.id)
        : []
    }
    // ALB Tarım: flat list
    return parentCategories
  }, [hasHierarchy, activeParentCat, childCategories, parentCategories])

  // ── Ürün filtreleme ────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...initialProducts]

    // 1. Kullanim (parent) filtresi
    if (hasHierarchy && activeParentCat && !activeCategory) {
      list = list.filter((p) => p.category.parentId === activeParentCat.id)
    }

    // 2. Kategori (child) filtresi — kullanım filtreden önce gelir çünkü daha spesifik
    if (activeCategory) {
      list = list.filter((p) => p.category.slug === activeCategory)
    }

    // 3. Arama filtresi
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
  }, [initialProducts, hasHierarchy, activeParentCat, activeCategory, searchQuery, sort])

  // ── URL yardımcıları ───────────────────────────────────────────────────────

  const setKullanim = (slug: string) => {
    const sp = new URLSearchParams()
    if (slug) sp.set('kullanim', slug)
    router.push(`?${sp.toString()}`)
  }

  const setCategory = (slug: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (slug) sp.set('kategori', slug)
    else sp.delete('kategori')
    // Child seçilince kullanim da tutulur
    router.push(`?${sp.toString()}`)
  }

  const clearAll = () => router.push('?')

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)
    toast.success(`${product.name} sepete eklendi`)
  }

  const discount = (product: Product) =>
    product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : null

  // Aktif kategori etiketi (breadcrumb görünümü için)
  const activeCategoryLabel = useMemo(() => {
    if (activeCategory) {
      return childCategories.find((c) => c.slug === activeCategory)?.name
        ?? initialCategories.find((c) => c.slug === activeCategory)?.name
    }
    if (activeParentCat) return activeParentCat.name
    return null
  }, [activeCategory, activeParentCat, childCategories, initialCategories])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Breadcrumb + başlık ── */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container-main">
          <nav className="text-sm text-gray-500 mb-3">
            <Link href={`/${brandKey}`} className="hover:text-gray-900 transition-colors">
              {cfg.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Ürünler</span>
            {activeCategoryLabel && (
              <>
                <span className="mx-2">/</span>
                <span className={`font-semibold ${accentText}`}>{activeCategoryLabel}</span>
              </>
            )}
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            {cfg.name} Ürünleri
          </h1>
          <p className="text-gray-500 mt-1">{filtered.length} ürün listeleniyor</p>
        </div>
      </div>

      {/* ── Alb Su: Parent Kategori Sekmeleri ── */}
      {hasHierarchy && (
        <div className="bg-white border-b border-gray-100">
          <div className="container-main">
            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
              <button
                onClick={clearAll}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  !activeKullanim && !activeCategory
                    ? activePillCls
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tüm Ürünler
              </button>
              {parentCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setKullanim(cat.slug)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeKullanim === cat.slug
                      ? activePillCls
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container-main py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar: Alt kategoriler (Alb Su) veya flat liste (ALB Tarım) ── */}
          <aside className="hidden lg:block lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                {hasHierarchy
                  ? (activeParentCat ? activeParentCat.name : 'Kategoriler')
                  : 'Kategoriler'}
              </h3>

              {/* "Tümü" butonu */}
              {(!hasHierarchy || sidebarCategories.length > 0) && (
                <button
                  onClick={() => {
                    if (hasHierarchy && activeKullanim) {
                      // Alt kategoriler sıfırla, parent tab kalsın
                      const sp = new URLSearchParams()
                      sp.set('kullanim', activeKullanim)
                      router.push(`?${sp.toString()}`)
                    } else {
                      clearAll()
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
                    !activeCategory
                      ? `${primaryColor} text-white font-semibold`
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {hasHierarchy && activeParentCat ? `Tüm ${activeParentCat.name}` : 'Tüm Ürünler'}
                </button>
              )}

              {/* Kategori listesi */}
              {sidebarCategories.map((cat) => (
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
                  {cat.productCount != null && (
                    <span className={`text-xs ${activeCategory === cat.slug ? 'text-white/70' : 'text-gray-400'}`}>
                      {cat.productCount}
                    </span>
                  )}
                </button>
              ))}

              {/* Alb Su: Parent seçili ama hiç alt kategori yoksa mesaj */}
              {hasHierarchy && activeParentCat && sidebarCategories.length === 0 && (
                <p className="text-xs text-gray-400 px-3 py-2">Alt kategori bulunamadı.</p>
              )}

              {/* Alb Su: Hiç parent seçili değilse yönlendirme ipucu */}
              {hasHierarchy && !activeParentCat && (
                <p className="text-xs text-gray-400 px-3 py-2 leading-relaxed">
                  Üstteki sekmelerden bir kullanım alanı seçin.
                </p>
              )}
            </div>
          </aside>

          {/* ── Ana İçerik ── */}
          <div className="flex-1">
            {/* Mobil: Alb Su için yatay scroll kategori şeridi */}
            {hasHierarchy && activeParentCat && sidebarCategories.length > 0 && (
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                <button
                  onClick={() => setKullanim(activeKullanim)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    !activeCategory ? `${primaryColor} text-white` : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  Tümü
                </button>
                {sidebarCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setCategory(cat.slug)}
                    className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeCategory === cat.slug
                        ? `${primaryColor} text-white`
                        : 'bg-white border border-gray-200 text-gray-600'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Sıralama */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {activeCategoryLabel && (
                  <span className={`font-semibold ${accentText}`}>
                    {activeCategoryLabel} •{' '}
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
                <button onClick={clearAll} className={`mt-4 ${accentText} underline text-sm`}>
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
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                          <ProductImage
                            src={primaryImg}
                            alt={product.name}
                            fallback={product.category.icon || '📦'}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          />
                          {disc && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                              -%{disc}
                            </span>
                          )}
                          {product.isFeatured && !disc && (
                            <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white z-10 ${isAlbSu ? 'bg-blue-600' : 'bg-green-600'}`}>
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
