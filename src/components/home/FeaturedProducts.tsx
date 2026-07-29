'use client'
import { useState } from 'react'
import { MOCK_PRODUCTS } from '@/data/mock'
import { ACTIVE_BRAND_KEY, BRAND } from '@/lib/constants'
import ProductCard from '@/components/ui/ProductCard'
import Reveal from '@/components/ui/Reveal'
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
        <Reveal className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <p className={`text-sm font-semibold ${BRAND.colors.primaryText} uppercase tracking-wide mb-1`}>Seçkin Ürünler</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Öne Çıkan Ürünler</h2>
          </div>
          <Link href="/urunler" className={`arrow-slide ${BRAND.colors.primaryText} font-semibold hover:underline text-sm`}>
            Tüm Ürünleri Gör <span className="arrow">→</span>
          </Link>
        </Reveal>
        {/* Sekme Bar */}
        <Reveal delay={80} className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`btn-press px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${activeTab===tab ? BRAND.colors.accentPrimary : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {tab}
            </button>
          ))}
        </Reveal>
        {/* Ürün Grid — sekme değişince kartlar yeniden akar */}
        {filtered.length > 0 ? (
          <div key={activeTab} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <div
                key={product.id}
                className="anim-fade-up"
                style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 anim-fade-in">Bu kategoride ürün bulunamadı.</div>
        )}
      </div>
    </section>
  )
}
