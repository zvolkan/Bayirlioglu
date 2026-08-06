import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBrandsForAdmin } from '@/app/actions/admin'
import { getBlogPostForEdit } from '@/app/actions/blog'
import BlogForm from '../../_components/BlogForm'

export const dynamic = 'force-dynamic'

export default async function BlogDuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [rawBrands, post] = await Promise.all([getBrandsForAdmin(), getBlogPostForEdit(id)])

  if (!post) notFound()

  const brands = rawBrands.map((b: { id: number; key: string; name: string }) => ({
    id: b.id,
    key: b.key,
    name: b.name,
  }))

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/blog" className="text-sm text-gray-500 hover:text-gray-700">
          ← Blog Yazıları
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Yazıyı Düzenle</h1>
        <p className="text-sm text-gray-500 mt-0.5 font-mono">{post.slug}</p>
      </div>
      <BlogForm
        brands={brands}
        defaultValues={{
          id: post.id,
          brandId: post.brandId,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          coverImage: post.coverImage,
          author: post.author,
          isPublished: post.isPublished,
        }}
      />
    </div>
  )
}
