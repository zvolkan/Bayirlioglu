import type { Metadata } from 'next'
import Link from 'next/link'
import { BRAND, ACTIVE_BRAND_KEY } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { MOCK_BLOG_POSTS } from '@/data/mock'
import type { BlogPost } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tarım ve teknoloji haberleri',
}

const tabFilters = [
  { label: 'Tümü', href: '/blog' },
  { label: 'Tarım', href: '/blog?kategori=tarim' },
  { label: 'Teknoloji', href: '/blog?kategori=teknoloji' },
  { label: 'İpuçları', href: '/blog?kategori=ipuclari' },
]

function getBrandLabel(brand: BlogPost['brand']) {
  if (brand === 'alb-tarim') return 'Tarım'
  if (brand === 'alb-su-aritma') return 'Teknoloji'
  return 'Genel'
}

export default function BlogPage() {
  const subtitle =
    ACTIVE_BRAND_KEY === 'alb-tarim'
      ? 'Tarım, verimlilik ve modern çiftçilik üzerine uzman görüşleri'
      : 'Su arıtma, klima ve akıllı ev teknolojileri hakkında güncel bilgiler'

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className={`${BRAND.colors.fallbackGradient} py-16 sm:py-20`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Blog & Haberler</h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">{subtitle}</p>
        </div>
      </section>

      {/* Sekme Filtreleri (static links) */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <nav className="flex gap-1 overflow-x-auto py-3">
            {tabFilters.map((tab, idx) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex-shrink-0 px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  idx === 0
                    ? `${BRAND.colors.accentPrimary} text-white`
                    : `text-gray-600 hover:text-gray-900 hover:bg-gray-100`
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {MOCK_BLOG_POSTS.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl">Henüz blog yazısı bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_BLOG_POSTS.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group"
                >
                  {/* GÖRSEL: /public/images/blog/ blog kapak görselleri ekleyin */}
                  <div className={`h-48 ${BRAND.colors.primaryLight} flex items-center justify-center`}>
                    <span className="text-5xl">📰</span>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    {/* Kategori Badge */}
                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${BRAND.colors.badgeStyle}`}>
                        {getBrandLabel(post.brand)}
                      </span>
                    </div>

                    {/* Başlık */}
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:underline">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>

                    {/* Meta: Yazar, Tarih, Okuma Süresi */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-5 border-t border-gray-100 pt-4">
                      <span className="flex items-center gap-1">
                        <span>✍️</span>
                        <span>{post.author}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{formatDate(post.publishedAt)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{post.readTime} dk okuma</span>
                      </span>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className={`inline-flex items-center gap-1 font-semibold text-sm transition-all duration-200 ${BRAND.colors.primaryText} hover:opacity-80`}
                    >
                      Devamını Oku →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
