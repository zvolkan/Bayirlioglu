import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BRANDS } from '@/lib/constants'
import { MOCK_BLOG_POSTS } from '@/data/mock'
import type { BrandKey } from '@/lib/types'

const VALID_BRANDS: BrandKey[] = ['alb-tarim', 'alb-su-aritma']

interface Props {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  if (!VALID_BRANDS.includes(brand as BrandKey)) return {}
  const cfg = BRANDS[brand as BrandKey]
  return {
    title: `Blog | ${cfg.name}`,
    description: `${cfg.name} blog yazıları, ipuçları ve sektör haberleri.`,
  }
}

export default async function BlogPage({ params }: Props) {
  const { brand } = await params
  if (!VALID_BRANDS.includes(brand as BrandKey)) notFound()

  const brandKey = brand as BrandKey
  const isAlbSu = brandKey === 'alb-su-aritma'
  const cfg = BRANDS[brandKey]
  const posts = MOCK_BLOG_POSTS.filter((p) => p.brand === brandKey)

  const heroBg = isAlbSu ? 'from-blue-900 to-blue-950' : 'from-green-900 to-emerald-950'
  const tagBg = isAlbSu ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
  const accentText = isAlbSu ? 'text-blue-600' : 'text-green-600'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className={`bg-gradient-to-br ${heroBg} py-16`}>
        <div className="container-main text-center">
          <nav className="text-sm text-white/50 mb-6">
            <Link href={`/${brandKey}`} className="hover:text-white transition-colors">{cfg.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">Blog</span>
          </nav>
          <p className={`font-bold uppercase text-sm tracking-widest mb-3 ${isAlbSu ? 'text-blue-400' : 'text-green-400'}`}>
            Blog
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {cfg.name} Blog
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Sektör haberleri, ürün rehberleri ve uzman ipuçları
          </p>
        </div>
      </section>

      <div className="container-main py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-gray-500">Henüz blog yazısı bulunmuyor.</p>
          </div>
        ) : (
          <>
            {/* Öne çıkan yazı */}
            <div className="mb-10">
              <Link
                href={`/${brandKey}/blog/${posts[0].slug}`}
                className="group grid md:grid-cols-2 bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* GÖRSEL: {posts[0].coverImage} */}
                <div className={`bg-gradient-to-br ${heroBg} flex items-center justify-center min-h-52 md:min-h-64 text-7xl`}>
                  {isAlbSu ? '💧' : '🌱'}
                </div>
                <div className="p-8 flex flex-col justify-center">
                  {posts[0].tags && posts[0].tags.length > 0 && (
                    <span className={`inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4 w-fit ${tagBg}`}>
                      {posts[0].tags[0]}
                    </span>
                  )}
                  <h2 className="text-2xl font-black text-gray-900 leading-tight mb-3 group-hover:text-gray-700 transition-colors">
                    {posts[0].title}
                  </h2>
                  <p className="text-gray-500 leading-relaxed mb-5">{posts[0].excerpt}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>{posts[0].author}</span>
                    <span>·</span>
                    <span>
                      {new Date(posts[0].publishedAt).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                    {posts[0].readTime && (
                      <>
                        <span>·</span>
                        <span>{posts[0].readTime} dk okuma</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>

            {/* Diğer yazılar */}
            {posts.length > 1 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.slice(1).map((post) => (
                  <Link
                    key={post.slug}
                    href={`/${brandKey}/blog/${post.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    {/* GÖRSEL: {post.coverImage} */}
                    <div className={`aspect-[16/9] bg-gradient-to-br ${heroBg} flex items-center justify-center text-5xl`}>
                      {isAlbSu ? '💧' : '🌱'}
                    </div>
                    <div className="p-5">
                      {post.tags && post.tags.length > 0 && (
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-3 ${tagBg}`}>
                          {post.tags[0]}
                        </span>
                      )}
                      <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{post.author}</span>
                        {post.readTime && <span>{post.readTime} dk</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
