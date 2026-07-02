import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BRANDS } from '@/lib/constants'
import { MOCK_BLOG_POSTS } from '@/data/mock'
import type { BrandKey } from '@/lib/types'

interface Props {
  params: Promise<{ brand: string; slug: string }>
}

export async function generateStaticParams() {
  return MOCK_BLOG_POSTS.map((p) => ({ brand: p.brand, slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, brand } = await params
  const post = MOCK_BLOG_POSTS.find((p) => p.slug === slug && p.brand === brand)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { brand, slug } = await params
  const brandKey = brand as BrandKey
  const post = MOCK_BLOG_POSTS.find((p) => p.slug === slug && p.brand === brandKey)
  if (!post) notFound()

  const cfg = BRANDS[brandKey] ?? BRANDS['alb-tarim']
  const isAlbSu = brandKey === 'alb-su-aritma'
  const accentText = isAlbSu ? 'text-blue-600' : 'text-green-600'
  const tagBg = isAlbSu ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
  const heroBg = isAlbSu ? 'from-blue-900 to-blue-950' : 'from-green-900 to-emerald-950'

  const related = MOCK_BLOG_POSTS.filter(
    (p) => p.brand === brandKey && p.slug !== slug
  ).slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${heroBg} py-16`}>
        <div className="container-main max-w-3xl">
          <nav className="text-sm text-white/50 mb-6 flex flex-wrap gap-2 items-center">
            <Link href={`/${brandKey}`} className="hover:text-white transition-colors">{cfg.name}</Link>
            <span>/</span>
            <Link href={`/${brandKey}/blog`} className="hover:text-white transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-white/70 line-clamp-1">{post.title}</span>
          </nav>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <span key={tag} className={`inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${tagBg}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
            <span>✍️ {post.author}</span>
            <span>·</span>
            <span>
              {new Date(post.publishedAt).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
            {post.readTime && (
              <>
                <span>·</span>
                <span>⏱ {post.readTime} dk okuma</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="container-main py-12 max-w-3xl">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-8 md:p-12">
          {/* Kapak görseli placeholder */}
          {/* GÖRSEL: {post.coverImage} */}
          <div className={`aspect-[16/9] bg-gradient-to-br ${heroBg} rounded-2xl flex items-center justify-center text-7xl mb-10`}>
            {isAlbSu ? '💧' : '🌱'}
          </div>

          {/* Özet */}
          <p className="text-xl text-gray-600 leading-relaxed font-medium border-l-4 border-gray-200 pl-5 mb-8 italic">
            {post.excerpt}
          </p>

          {/* İçerik */}
          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
            {post.content && !post.content.startsWith('<!--') ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <div className="space-y-5">
                <p>
                  Bu yazımızda <strong>{post.title.toLowerCase()}</strong> konusunu detaylıca ele alıyoruz.
                  {cfg.name} uzman ekibimiz tarafından hazırlanan bu içerik, sektörün en güncel
                  bilgilerini ve pratik önerilerini kapsamaktadır.
                </p>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Temel Bilgiler</h2>
                <p>
                  {post.excerpt} Konuyla ilgili daha fazla bilgi almak ve uzman desteği için
                  müşteri hizmetlerimizle iletişime geçebilirsiniz.
                </p>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Sonuç</h2>
                <p>
                  Daha fazla bilgi almak veya{' '}
                  <Link href={`/${brandKey}/iletisim`} className={accentText}>
                    {cfg.name} ekibiyle iletişime geçmek
                  </Link>{' '}
                  için bize ulaşabilirsiniz.
                </p>
              </div>
            )}
          </div>

          {/* Etiketler */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Etiketler</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Alt navigasyon */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/${brandKey}/blog`}
              className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              ← Tüm Yazılar
            </Link>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(post.title + ' — ' + cfg.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-semibold bg-[#25D366] text-white px-4 py-2 rounded-xl hover:bg-[#1aad50] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Paylaş
            </a>
          </div>
        </div>

        {/* İlgili Yazılar */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-black text-gray-900 mb-6">Diğer Yazılar</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${brandKey}/blog/${p.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className={`aspect-[16/9] bg-gradient-to-br ${heroBg} flex items-center justify-center text-4xl`}>
                    {isAlbSu ? '💧' : '🌱'}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-gray-700 transition-colors">
                      {p.title}
                    </p>
                    {p.readTime && <p className="text-gray-400 text-xs mt-2">{p.readTime} dk</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
