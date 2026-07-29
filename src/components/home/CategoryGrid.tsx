import Link from 'next/link'
import { MOCK_CATEGORIES_TARIM, MOCK_CATEGORIES_ALBSU } from '@/data/mock'
import { ACTIVE_BRAND_KEY, BRAND } from '@/lib/constants'
import Reveal from '@/components/ui/Reveal'
import RevealGroup from '@/components/ui/RevealGroup'

const categories = ACTIVE_BRAND_KEY === 'alb-tarim' ? MOCK_CATEGORIES_TARIM : MOCK_CATEGORIES_ALBSU

const iconHoverBg =
  ACTIVE_BRAND_KEY === 'alb-tarim'
    ? 'group-hover:bg-green-50'
    : 'group-hover:bg-blue-50'

export default function CategoryGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Başlık */}
        <Reveal className="text-center mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Ürün Kategorilerimiz
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Her İhtiyacınıza Çözüm
          </h2>
        </Reveal>

        {/* Kategori Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <RevealGroup variant="scale" stagger={60} itemClassName="h-full">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/urunler?kategori=${category.slug}`}
                className="h-full flex flex-col bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group"
              >
                {/* GÖRSEL: /public/images/categories/{slug}.jpg ikon yerine kullanılabilir */}
                <div
                  className={`icon-pop w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-50 ${iconHoverBg} flex items-center justify-center text-3xl transition-colors duration-300`}
                >
                  {category.icon ?? '📦'}
                </div>
                <p className="font-semibold text-gray-800 text-sm leading-snug">
                  {category.name}
                </p>
                {typeof category.productCount === 'number' && (
                  <p className="text-xs text-gray-400 mt-1">
                    {category.productCount} ürün
                  </p>
                )}
              </Link>
            ))}
          </RevealGroup>
        </div>

        {/* Tüm Kategorileri Gör */}
        <Reveal delay={120} className="mt-8 flex justify-center">
          <Link
            href="/urunler"
            className={`${BRAND.colors.accentPrimary} btn-press w-fit px-6 py-3 rounded-xl font-semibold`}
          >
            Tüm Kategorileri Gör
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
