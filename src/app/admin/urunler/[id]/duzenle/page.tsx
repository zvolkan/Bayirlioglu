import { notFound } from 'next/navigation'
import {
  getBrandsForAdmin,
  getCategoriesForAdmin,
  getProductForEdit,
  updateProduct,
} from '@/app/actions/admin'
import ProductForm from '../../_components/ProductForm'

export default async function DuzenleUrunPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [brands, categories, product] = await Promise.all([
    getBrandsForAdmin(),
    getCategoriesForAdmin(),
    getProductForEdit(id),
  ])

  if (!product) notFound()

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateProduct(id, formData)
  }

  return (
    <div className="space-y-6">
      <div>
        <a
          href="/admin/urunler"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Ürünlere Dön
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Ürünü Düzenle</h1>
        <p className="text-sm text-gray-500 mt-0.5 font-mono">{product.slug}</p>
      </div>

      <ProductForm
        brands={brands}
        categories={categories.map((c) => ({ id: c.id, name: c.name, brand: c.brand }))}
        action={handleUpdate}
        submitLabel="Değişiklikleri Kaydet"
        defaultValues={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          shortDescription: product.shortDescription ?? '',
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : null,
          stock: product.stockQuantity,
          unit: product.unit,
          sku: product.sku ?? '',
          brandId: product.brandId,
          categoryId: product.categoryId,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          specs: product.specs.map((s) => ({
            name: s.specName,
            value: s.specValue,
            unit: s.specUnit ?? '',
          })),
          images: product.images.map((img) => ({
            id: img.id,
            url: img.url,
            isPrimary: img.isPrimary,
          })),
        }}
      />
    </div>
  )
}
