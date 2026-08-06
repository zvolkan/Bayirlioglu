import Link from 'next/link'
import { getBrandsForAdmin } from '@/app/actions/admin'
import BlogForm from '../_components/BlogForm'

export const dynamic = 'force-dynamic'

export default async function YeniBlogPage() {
  const rawBrands = await getBrandsForAdmin()
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
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Yeni Yazı</h1>
      </div>
      <BlogForm brands={brands} />
    </div>
  )
}
