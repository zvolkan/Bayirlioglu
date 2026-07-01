import { getBrandsForAdmin, getCategoriesForAdmin, createProduct } from '@/app/actions/admin'
import ProductForm from '../_components/ProductForm'

export default async function YeniUrunPage() {
  const [brands, categories] = await Promise.all([
    getBrandsForAdmin(),
    getCategoriesForAdmin(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <a
          href="/admin/urunler"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Ürünlere Dön
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Yeni Ürün Ekle</h1>
      </div>

      <ProductForm
        brands={brands}
        categories={categories.map((c) => ({ id: c.id, name: c.name, brand: c.brand }))}
        action={createProduct}
        submitLabel="Ürünü Kaydet"
      />
    </div>
  )
}
