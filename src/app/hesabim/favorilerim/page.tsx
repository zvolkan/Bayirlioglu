'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ACTIVE_BRAND_KEY } from '@/lib/constants'
import { cn, formatPrice, calculateDiscount } from '@/lib/utils'
import { MOCK_PRODUCTS } from '@/data/mock'
import { useState } from 'react'

const primaryBg = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'bg-green-600' : 'bg-blue-600'
const primaryHover = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'hover:bg-green-500' : 'hover:bg-blue-500'
const primaryLight = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
const primaryColor = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'text-green-600' : 'text-blue-600'

const MOCK_USER = { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet.yilmaz@email.com' }

function AccountSidebar({ active }: { active: string }) {
  const router = useRouter()
  const links = [
    { href: '/hesabim', label: 'Hesabım', icon: '👤' },
    { href: '/hesabim/siparislerim', label: 'Siparişlerim', icon: '📦' },
    { href: '/hesabim/adreslerim', label: 'Adreslerim', icon: '📍' },
    { href: '/hesabim/favorilerim', label: 'Favorilerim', icon: '❤️' },
  ]
  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={cn('p-6', primaryBg)}>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold mb-3">
            {MOCK_USER.firstName[0]}{MOCK_USER.lastName[0]}
          </div>
          <p className="text-white font-semibold">{MOCK_USER.firstName} {MOCK_USER.lastName}</p>
          <p className="text-white/70 text-sm">{MOCK_USER.email}</p>
        </div>
        <nav className="p-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href}
              className={cn('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                active === link.href ? primaryLight : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <button onClick={() => router.push('/giris')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
          >
            <span>🚪</span>
            Çıkış Yap
          </button>
        </nav>
      </div>
    </aside>
  )
}

export default function FavorilerimPage() {
  // Mock: first 3 products are in favorites
  const [favorites, setFavorites] = useState(MOCK_PRODUCTS.slice(0, 3))

  const remove = (id: number) => setFavorites(favorites.filter((p) => p.id !== id))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">Ana Sayfa</Link>
          <span className="mx-2">/</span>
          <Link href="/hesabim" className="hover:text-gray-900">Hesabım</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Favorilerim</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar active="/hesabim/favorilerim" />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-2xl font-bold text-gray-900">Favorilerim</h1>
              <span className="text-sm text-gray-500">{favorites.length} ürün</span>
            </div>

            {favorites.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-5xl mb-4">❤️</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Favori listeniz boş</h3>
                <p className="text-gray-500 mb-6">Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca bulabilirsiniz.</p>
                <Link href="/urunler"
                  className={cn('inline-flex px-6 py-3 rounded-xl text-white font-semibold transition-colors', primaryBg, primaryHover)}
                >
                  Ürünleri Keşfet
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((product) => {
                  const discount = product.salePrice ? calculateDiscount(product.price, product.salePrice) : 0
                  return (
                    <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                      {/* Image */}
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        {/* IMAGE PLACEHOLDER: /public/images/{product.slug}.jpg dosyasını ekleyin */}
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                          🛒
                        </div>
                        {discount > 0 && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{discount}%
                          </span>
                        )}
                        <button
                          onClick={() => remove(product.id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-full flex items-center justify-center transition-colors"
                          title="Favorilerden çıkar"
                        >
                          ❤️
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <Link href={`/urunler/${product.slug}`}>
                          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-green-600 transition-colors mb-2">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mb-3">
                          {product.salePrice ? (
                            <>
                              <span className="text-lg font-bold text-gray-900">{formatPrice(product.salePrice)}</span>
                              <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/urunler/${product.slug}`}
                            className="flex-1 text-center text-sm py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                          >
                            İncele
                          </Link>
                          <button
                            className={cn('flex-1 text-sm py-2 rounded-xl text-white font-semibold transition-colors', primaryBg, primaryHover)}
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
