'use client'
import { useState } from 'react'
import { MOCK_PRODUCTS } from '@/data/mock'
import { ACTIVE_BRAND_KEY, BRAND } from '@/lib/constants'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'

const tabs = ['Tümü', 'Öne Çıkanlar', 'Kampanyalı', 'Yeni Ürünler']
const brandProducts = MOCK_PRODUCTS.filter(p => p.brand === ACTIVE_BRAND_KEY)

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState('Tümü')

  const filtered = activeTab === 'Tümü' ? brandProducts
    : activeTab === 'Öne Çıkanlar' ? brandProducts.filter(p => p.isFeatured)
    : activeTab === 'Kampanyalı' ? brandProducts.filter(p => p.salePrice)
    : brandProducts.slice(-3) // Yeni ürünler stub

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Başlık */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <p className={`text-sm font-semibold ${BRAND.colors.primaryText} uppercase tracking-wide mb-1`}>Seçkin Ürünler</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Öne Çıkan Ürünler</h2>
          </div>
          <Link href="/urunler" className={`${BRAND.colors.primaryText} font-semibold hover:underline text-sm`}>Tüm Ürünleri Gör →</Link>
        </div>
        {/* Sekme Bar */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab===tab ? BRAND.colors.accentPrimary : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {tab}
            </button>
          ))}
        </div>
        {/* Ürün Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(product => <ProductCard key={product.id} product={product}/>)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">Bu kategoride ürün bulunamadı.</div>
        )}
      </div>
    </section>
  )
}
