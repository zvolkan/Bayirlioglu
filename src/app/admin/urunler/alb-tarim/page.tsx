import Link from 'next/link'
import { getProductsForAdmin } from '@/app/actions/admin'
import ProductTable from '../_components/ProductTable'

export const dynamic = 'force-dynamic'

export default async function AlbTarimUrunlerPage() {
  const products = await getProductsForAdmin('alb-tarim')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <a
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Admin'e Dön
          </a>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">ALB Tarım Ürünleri</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} ürün</p>
        </div>
        <Link
          href="/admin/urunler/alb-tarim/yeni"
          className="px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition-colors"
        >
          + Yeni Ürün
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  )
}
