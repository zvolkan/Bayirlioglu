import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BRANDS } from '@/lib/constants'
import { MOCK_PRODUCTS, MOCK_CATEGORIES_TARIM, MOCK_CATEGORIES_ALBSU, MOCK_BLOG_POSTS } from '@/data/mock'
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
    title: cfg.name,
    description: cfg.description,
  }
}

export async function generateStaticParams() {
  return VALID_BRANDS.map((brand) => ({ brand }))
}

export default async function BrandHomePage({ params }: Props) {
  const { brand } = await params
  if (!VALID_BRANDS.includes(brand as BrandKey)) notFound()

  const brandKey = brand as BrandKey
  const cfg = BRANDS[brandKey]

  const isAlbSu = brandKey === 'alb-su-aritma'
  const brandProducts = MOCK_PRODUCTS.filter((p) => p.brand === brandKey && p.isFeatured).slice(0, 6)
  const brandCategories = isAlbSu ? MOCK_CATEGORIES_ALBSU : MOCK_CATEGORIES_TARIM
  const brandPosts = MOCK_BLOG_POSTS.filter((p) => p.brand === brandKey).slice(0, 3)

  const heroBg = isAlbSu
    ? 'from-blue-950 via-blue-900 to-cyan-950'
    : 'from-green-950 via-green-900 to-emerald-950'
  const primaryBtn = isAlbSu ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
  const outlineBtn = isAlbSu ? 'border-blue-400/60 hover:bg-blue-400/10' : 'border-green-400/60 hover:bg-green-400/10'
  const badgeBg = isAlbSu
    ? 'bg-blue-500/15 border-blue-400/30 text-blue-300'
    : 'bg-green-500/15 border-green-400/30 text-green-300'
  const tagText = isAlbSu ? 'text-blue-400' : 'text-green-400'
  const accentText = isAlbSu ? 'text-blue-600' : 'text-green-600'
  const categoryBg = isAlbSu
    ? 'from-blue-50 to-cyan-50 border-blue-100 hover:shadow-blue-100'
    : 'from-green-50 to-emerald-50 border-green-100 hover:shadow-green-100'
  const categoryIcon = isAlbSu ? 'bg-blue-600' : 'bg-green-600'
  const categoryLink = isAlbSu ? 'text-blue-600 hover:text-blue-700' : 'text-green-600 hover:text-green-700'

  return (
    <>
      {/* ── HERO ── */}
      <section className={`relative min-h-[80vh] flex items-center bg-gradient-to-br ${heroBg} overflow-hidden`}>
        {/* VIDEO: /public/videos/${brandKey}-hero.mp4 */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_left,white,transparent_60%)]" />

        <div className="relative z-10 container-main py-20 w-full">
          <div className="max-w-2xl">
            <span className={`inline-flex items-center gap-2 border rounded-full text-sm px-4 py-1.5 mb-8 font-medium ${badgeBg}`}>
              <span className="w-2 h-2 rounded-full bg-current opacity-80 animate-pulse" />
              {cfg.badge}
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              {cfg.tagline.split('\n').map((line, i) => (
                <span key={i} className={i === 1 ? `block ${tagText}` : 'block'}>
                  {line}
                </span>
              ))}
            </h1>
            <p className="text-white/60 text-lg mb-2">{cfg.subtitle}</p>
            <p className="text-white/80 text-base leading-relaxed mb-10 max-w-xl">
              {cfg.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${brandKey}/urunler`}
                className={`${primaryBtn} text-white px-7 py-3.5 rounded-xl font-semibold transition-colors shadow-lg`}
              >
                {cfg.cta.label}
              </Link>
              <Link
                href={`/${brandKey}${cfg.ctaSecondary.href}`}
                className={`border-2 ${outlineBtn} text-white px-7 py-3.5 rounded-xl font-semibold transition-colors`}
              >
                {cfg.ctaSecondary.label}
              </Link>
            </div>

            {/* İstatistikler */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10">
              {cfg.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-white/50 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── KATEGORİLER ── */}
      <section className="py-16 bg-white">
        <div className="container-main">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className={`font-bold uppercase text-sm tracking-widest mb-1 ${tagText}`}>Kategori</p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Ürün Kategorileri</h2>
            </div>
            <Link href={`/${brandKey}/urunler`} className={`hidden sm:block text-sm font-semibold ${categoryLink} transition-colors`}>
              Tüm Ürünler →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {brandCategories.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href={`/${brandKey}/urunler?kategori=${cat.slug}`}
                className={`group border bg-gradient-to-br ${categoryBg} rounded-2xl p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
              >
                <div className={`w-10 h-10 rounded-xl ${categoryIcon} text-white flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <p className="font-semibold text-gray-900 text-sm leading-tight">{cat.name}</p>
                {cat.productCount !== undefined && (
                  <p className="text-gray-500 text-xs mt-1">{cat.productCount} ürün</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÖNE ÇIKAN ÜRÜNLER ── */}
      {brandProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-main">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className={`font-bold uppercase text-sm tracking-widest mb-1 ${tagText}`}>Seçili Ürünler</p>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Öne Çıkan Ürünler</h2>
              </div>
              <Link href={`/${brandKey}/urunler`} className={`hidden sm:block text-sm font-semibold ${categoryLink} transition-colors`}>
                Tümünü Gör →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {brandProducts.map((product) => {
                const displayPrice = product.salePrice ?? product.price
                return (
                  <Link
                    key={product.slug}
                    href={`/${brandKey}/urunler/${product.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    {/* GÖRSEL: /public/images/products/${product.slug}.jpg */}
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl relative">
                      {product.category.icon || '📦'}
                      {product.salePrice && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          İndirim
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-gray-900 font-semibold text-xs leading-tight line-clamp-2 mb-1">{product.name}</p>
                      <p className="text-gray-500 text-[10px] mb-2">{product.category.name}</p>
                      <div className="flex items-center justify-between">
                        <p className={`font-black text-sm ${accentText}`}>
                          {displayPrice.toLocaleString('tr-TR')} ₺
                        </p>
                        {product.salePrice && (
                          <p className="text-gray-400 text-[10px] line-through">
                            {product.price.toLocaleString('tr-TR')} ₺
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── NEDEN BİZ ── */}
      <section className="py-16 bg-white">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className={`font-bold uppercase text-sm tracking-widest mb-2 ${tagText}`}>Avantajlar</p>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Neden {cfg.name}?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(isAlbSu
              ? [
                  { icon: '🔬', title: 'İleri Teknoloji', desc: 'Dünya markası ürünleri en uygun fiyatlarla sunuyoruz.' },
                  { icon: '🛠️', title: 'Profesyonel Montaj', desc: 'Sertifikalı teknisyenlerimiz kurulumu üstlenir.' },
                  { icon: '📞', title: '7/24 Teknik Destek', desc: 'Arızanızı en kısa sürede çözüyoruz.' },
                  { icon: '🛡️', title: '2 Yıl Garanti', desc: 'Tüm ürünlerimizde tam garanti güvencesi.' },
                ]
              : [
                  { icon: '🌿', title: 'Organik Sertifikalı', desc: 'Ürünlerimiz organik tarım standartlarına uygundur.' },
                  { icon: '🚜', title: 'Saha Danışmanlık', desc: 'Uzman agronomlarımız tarlada yanınızda.' },
                  { icon: '🚚', title: 'Hızlı Teslimat', desc: '81 ile 2-3 iş günü içinde teslimat.' },
                  { icon: '💰', title: 'Uygun Fiyat', desc: 'Çiftçi dostu fiyatlarla kaliteli ürünler.' },
                ]
            ).map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      {brandPosts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-main">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className={`font-bold uppercase text-sm tracking-widest mb-1 ${tagText}`}>Blog</p>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Son Yazılar</h2>
              </div>
              <Link href={`/${brandKey}/blog`} className={`hidden sm:block text-sm font-semibold ${categoryLink} transition-colors`}>
                Tüm Yazılar →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {brandPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/${brandKey}/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  {/* GÖRSEL: /public/images/blog/${post.slug}.jpg */}
                  <div className={`aspect-[16/9] bg-gradient-to-br ${heroBg} flex items-center justify-center text-5xl`}>
                    {isAlbSu ? '💧' : '🌱'}
                  </div>
                  <div className="p-5">
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${accentText}`}>
                      {post.category}
                    </p>
                    <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>
                    <p className="text-gray-400 text-xs mt-3">
                      {new Date(post.publishedAt).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className={`py-20 bg-gradient-to-br ${heroBg}`}>
        <div className="container-main text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
            {isAlbSu ? 'Temiz Suya Kavuşmaya Hazır mısınız?' : 'Veriminizi Artırmaya Hazır mısınız?'}
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            {isAlbSu
              ? 'Ücretsiz keşif ve montaj için hemen iletişime geçin.'
              : 'Ücretsiz tarım danışmanlığı için hemen iletişime geçin.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${brandKey}/iletisim`}
              className={`${primaryBtn} text-white px-8 py-3.5 rounded-xl font-semibold transition-colors shadow-lg`}
            >
              İletişime Geç
            </Link>
            <a
              href={`https://wa.me/${cfg.whatsapp.phone}?text=${encodeURIComponent(cfg.whatsapp.message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1aad50] text-white px-8 py-3.5 rounded-xl font-semibold transition-colors shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
