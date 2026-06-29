import Link from 'next/link'
import { BRANDS, ACTIVE_BRAND_KEY } from '@/lib/constants'

export default function BrandCards() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-10">
          <span className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-2 block">
            Hizmet Alanlarımız
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            İki Güçlü Marka, Tek Çatı Altında
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ALB Tarim Karti */}
          <Link
            href="/urunler"
            className={[
              'bg-gradient-to-br from-green-600 to-emerald-700',
              'p-8 rounded-3xl text-white relative overflow-hidden cursor-pointer group',
              'hover:shadow-2xl hover:-translate-y-1 transition-all duration-200',
              ACTIVE_BRAND_KEY === 'alb-tarim' ? 'ring-4 ring-white/50 scale-[1.02]' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-2xl font-black mb-2">{BRANDS['alb-tarim'].name}</h3>
              <p className="text-white/80 mb-6">{BRANDS['alb-tarim'].description}</p>
              <span className="inline-block bg-white/20 hover:bg-white/30 transition-colors px-5 py-2 rounded-xl font-semibold text-sm">
                Ürünleri İncele →
              </span>
            </div>
          </Link>

          {/* Albsu Karti */}
          <Link
            href="/urunler"
            className={[
              'bg-gradient-to-br from-blue-600 to-cyan-700',
              'p-8 rounded-3xl text-white relative overflow-hidden cursor-pointer group',
              'hover:shadow-2xl hover:-translate-y-1 transition-all duration-200',
              ACTIVE_BRAND_KEY === 'alb-su-aritma' ? 'ring-4 ring-white/50 scale-[1.02]' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="text-5xl mb-4">💧</div>
              <h3 className="text-2xl font-black mb-2">{BRANDS['alb-su-aritma'].name}</h3>
              <p className="text-white/80 mb-6">{BRANDS['alb-su-aritma'].description}</p>
              <span className="inline-block bg-white/20 hover:bg-white/30 transition-colors px-5 py-2 rounded-xl font-semibold text-sm">
                Ürünleri İncele →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
