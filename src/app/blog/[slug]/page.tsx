import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BRAND, SITE_CONFIG } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { MOCK_BLOG_POSTS } from '@/data/mock';
import Badge from '@/components/ui/Badge';
import Breadcrumb from '@/components/ui/Breadcrumb';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = MOCK_BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return { title: `Yazı Bulunamadı | ${SITE_CONFIG.name}` };
  }

  return {
    title: `${post.title} | ${SITE_CONFIG.name}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

// ─── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return MOCK_BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

// ─── Sample article body paragraphs ───────────────────────────────────────────

const SAMPLE_PARAGRAPHS = [
  'Bu makalede konuya ilişkin kapsamlı bir değerlendirme sunmayı hedefliyoruz. Uzman ekibimizin sahada edindiği deneyimler ve güncel araştırma verileri ışığında hazırlanan bu içerik, hem yeni başlayanlar hem de deneyimli profesyoneller için faydalı bilgiler içermektedir.',
  'Doğru uygulama yöntemleri ve zamanlaması, elde edilecek verimin doğrudan belirleyicisidir. Bu nedenle her aşamayı dikkatle planlamak ve gerektiğinde uzman desteği almak büyük önem taşımaktadır.',
  'Alanda yapılan karşılaştırmalı testler, önerilen yöntemlerin geleneksel yaklaşımlara kıyasla ortalama %25-40 oranında daha yüksek verim sağladığını ortaya koymaktadır. Bu sonuçlar birden fazla sezon boyunca tutarlı biçimde tekrarlanmıştır.',
  'Sonuç olarak, doğru ürün seçimi, zamanında uygulama ve düzenli takip; başarının temel üç bileşenini oluşturmaktadır. Herhangi bir konuda destek almak için ekibimizle iletişime geçebilirsiniz.',
];

// ─── Page component ───────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = MOCK_BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) notFound();

  const relatedPosts = MOCK_BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 2);

  const primaryText = BRAND.colors.primaryText;
  const primaryLight = BRAND.colors.primaryLight;
  const primaryBorder = BRAND.colors.primaryBorder;

  const tocItems = [
    'Giriş',
    'Temel Bilgiler',
    'Uygulama Yöntemleri',
    'Sonuç ve Öneriler',
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Hero Image ────────────────────────────────────────── */}
      <div
        className={`relative w-full aspect-video max-h-[480px] overflow-hidden ${BRAND.colors.fallbackGradient}`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 select-none">
          <span className="text-8xl">📝</span>
        </div>
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${BRAND.colors.gradientOverlay}`} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.title },
            ]}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* ── Main content ──────────────────────────────────── */}
          <article className="min-w-0 flex-1">
            {/* Tags */}
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="primary" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="mb-6 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
              {post.title}
            </h1>

            {/* Author + meta strip */}
            <div className="mb-8 flex flex-wrap items-center gap-4 border-y border-gray-200 py-4">
              {/* Avatar */}
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${BRAND.colors.primary} text-sm font-bold text-white uppercase select-none`}
              >
                {post.author.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{post.author}</p>
                <p className="text-xs text-gray-500">İçerik Uzmanı</p>
              </div>
              <div className="flex flex-col items-end text-xs text-gray-500 shrink-0">
                <span>{formatDate(post.publishedAt)}</span>
                <span>{post.readTime} dakika okuma</span>
              </div>
            </div>

            {/* Excerpt / lead */}
            <p className="mb-8 text-lg leading-relaxed text-gray-700 font-medium border-l-4 pl-4 italic" style={{ borderColor: 'currentColor' }}>
              {post.excerpt}
            </p>

            {/* Article body */}
            <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
              {SAMPLE_PARAGRAPHS.map((para, i) => (
                <p key={i}>{para}</p>
              ))}

              <h2 className="text-xl font-bold text-gray-900 mt-8">Temel Uygulama Adımları</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Hazırlık ve planlama aşamasını eksiksiz tamamlayın.</li>
                <li>Gerekli malzeme ve ekipmanları önceden temin edin.</li>
                <li>Uygulama sırasında teknik talimatlara uyun.</li>
                <li>Sonuçları düzenli aralıklarla takip edin ve kayıt altına alın.</li>
              </ol>

              <h2 className="text-xl font-bold text-gray-900 mt-8">Önemli Notlar</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ürünleri serin ve kuru ortamda saklayın.</li>
                <li>Önerilen dozajı aşmayın.</li>
                <li>Herhangi bir sorunla karşılaştığınızda teknik ekibimizi arayın.</li>
              </ul>
            </div>

            {/* Tags section */}
            <div className={`mt-10 rounded-xl ${primaryLight} border ${primaryBorder} p-4`}>
              <p className="mb-2 text-sm font-semibold text-gray-700">Etiketler</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full border ${primaryBorder} ${primaryText} px-3 py-1 text-xs font-medium`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author bio card */}
            <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${BRAND.colors.primary} text-xl font-bold text-white uppercase select-none`}
                >
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{post.author}</p>
                  <p className={`text-sm font-medium ${primaryText}`}>İçerik Uzmanı</p>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {BRAND.name} bünyesinde yıllardan beri sektörde araştırma ve içerik üretimi
                    alanında çalışmaktadır. Uzmanı olduğu konularda çok sayıda makale ve rehber
                    hazırlamıştır.
                  </p>
                </div>
              </div>
            </div>

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-12">
                <h2 className="mb-6 text-xl font-bold text-gray-900">İlgili Yazılar</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {relatedPosts.map((rp) => (
                    <Link
                      key={rp.id}
                      href={`/blog/${rp.slug}`}
                      className="group flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                      {/* Thumbnail placeholder */}
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-3xl select-none">
                        📝
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 mb-1">{formatDate(rp.publishedAt)}</p>
                        <p className="font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:underline">
                          {rp.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* ── Sidebar ───────────────────────────────────────── */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            {/* Table of contents */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-900">İçindekiler</h3>
              <nav>
                <ol className="space-y-2 text-sm">
                  {tocItems.map((item, i) => (
                    <li key={item}>
                      <a
                        href={`#section-${i}`}
                        className={`flex items-center gap-2 ${primaryText} hover:underline`}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                          {i + 1}
                        </span>
                        {item}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            {/* Recent posts */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-900">Son Yazılar</h3>
              <ul className="space-y-4">
                {MOCK_BLOG_POSTS.slice(0, 3).map((rp) => (
                  <li key={rp.id}>
                    <Link
                      href={`/blog/${rp.slug}`}
                      className="group flex gap-3"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl select-none">
                        📝
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">{formatDate(rp.publishedAt)}</p>
                        <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 group-hover:underline">
                          {rp.title}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA card */}
            <div className={`rounded-2xl ${BRAND.colors.primary} p-5 text-white`}>
              <p className="font-bold text-lg mb-2">Uzman Desteği Alın</p>
              <p className="text-sm text-white/80 mb-4">
                Bu konu hakkında sorularınız mı var? Ekibimiz size yardımcı olmaya hazır.
              </p>
              <Link
                href="/iletisim"
                className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow transition hover:bg-gray-50"
                style={{ color: 'inherit' }}
              >
                İletişime Geç
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
