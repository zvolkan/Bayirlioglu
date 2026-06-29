import { BRAND, ACTIVE_BRAND_KEY } from '@/lib/constants'
import { MOCK_BLOG_POSTS } from '@/data/mock'
import Link from 'next/link'
import { cn, formatDate } from '@/lib/utils'

const isTarim = ACTIVE_BRAND_KEY === 'alb-tarim'
const posts = MOCK_BLOG_POSTS.slice(0, 3)

export default function BlogPreview() {
  if (posts.length === 0) return null

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span
              className={cn(
                'inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4',
                isTarim ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              )}
            >
              Blog
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Son Blog Yazıları
            </h2>
            <p className="text-gray-500 text-lg">
              {isTarim
                ? 'Tarım dünyasından güncel haberler ve uzman tavsiyeleri.'
                : 'Teknoloji ve ev konforuna dair güncel içerikler.'}
            </p>
          </div>
          <Link
            href="/blog"
            className={cn(
              'flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors',
              isTarim
                ? 'text-green-600 hover:text-green-700'
                : 'text-blue-600 hover:text-blue-700'
            )}
          >
            Tüm Yazılara Git
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Kart Grid (3 kolon) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Görsel Placeholder */}
              <div
                className={cn(
                  'relative h-48 overflow-hidden',
                  isTarim ? 'bg-green-50' : 'bg-blue-50'
                )}
              >
                <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">
                  📰
                </div>
                {/* Kategori Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={cn(
                      'inline-block text-xs font-semibold px-3 py-1 rounded-full',
                      isTarim
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white'
                    )}
                  >
                    {post.tags?.[0] ?? (isTarim ? 'Tarım' : 'Teknoloji')}
                  </span>
                </div>
              </div>

              {/* İçerik */}
              <div className="p-6 flex flex-col flex-1">
                {/* Başlık */}
                <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-gray-700 transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-5 flex-1">
                  {post.excerpt}
                </p>

                {/* Alt Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    {/* Yazar */}
                    {post.author && (
                      <span className="font-medium text-gray-600">{post.author}</span>
                    )}
                    {/* Tarih */}
                    <span>{formatDate(post.publishedAt)}</span>
                    {/* Okuma Süresi */}
                    {post.readTime && (
                      <span>{post.readTime} dk okuma</span>
                    )}
                  </div>
                </div>

                {/* Devamını Oku Linki */}
                <Link
                  href={`/blog/${post.slug}`}
                  className={cn(
                    'mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors',
                    isTarim
                      ? 'text-green-600 hover:text-green-700'
                      : 'text-blue-600 hover:text-blue-700'
                  )}
                >
                  Devamını Oku
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Alt CTA Butonu */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className={cn(
              'inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-200 hover:bg-gray-50',
              isTarim
                ? 'border-green-600 text-green-600'
                : 'border-blue-600 text-blue-600'
            )}
          >
            Tüm Blog Yazılarını Gör
          </Link>
        </div>
      </div>
    </section>
  )
}
