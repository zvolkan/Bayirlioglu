import Link from 'next/link'
import { getBlogPostsForAdmin } from '@/app/actions/blog'
import PublishToggle from './_components/PublishToggle'

export const dynamic = 'force-dynamic'

function formatDate(date: Date | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export default async function AdminBlogPage() {
  const posts = await getBlogPostsForAdmin()

  const drafts = posts.filter((p: { isPublished: boolean }) => !p.isPublished)
  const published = posts.filter((p: { isPublished: boolean }) => p.isPublished)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
            ← Admin Paneli
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Blog Yazıları</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {published.length} yayında · {drafts.length} taslak
          </p>
        </div>
        <Link
          href="/admin/blog/yeni"
          className="btn-press px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700"
        >
          + Yeni Yazı
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
          <p className="text-4xl mb-3">✍️</p>
          <p className="text-gray-500 mb-4">Henüz yazı yok.</p>
          <Link
            href="/admin/blog/yeni"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            İlk yazıyı oluşturun →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Başlık</th>
                  <th className="px-5 py-3">Marka</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Yayın</th>
                  <th className="px-5 py-3">Durum</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map(
                  (post: {
                    id: string
                    title: string
                    slug: string
                    category: string | null
                    isPublished: boolean
                    publishedAt: Date | null
                    brand: { key: string; name: string }
                  }) => (
                    <tr key={post.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/blog/${post.id}/duzenle`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">/{post.slug}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{post.brand.name}</td>
                      <td className="px-5 py-3 text-gray-600">{post.category ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-500">{formatDate(post.publishedAt)}</td>
                      <td className="px-5 py-3">
                        <PublishToggle id={post.id} isPublished={post.isPublished} />
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        {post.isPublished && (
                          <a
                            href={`/${post.brand.key}/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-gray-700 mr-3"
                          >
                            Önizle
                          </a>
                        )}
                        <Link
                          href={`/admin/blog/${post.id}/duzenle`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Düzenle
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
