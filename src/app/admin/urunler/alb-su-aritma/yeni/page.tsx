import { getBrandsForAdmin, getCategoriesForAdmin, createProduct } from '@/app/actions/admin'
import ProductForm from '../../_components/ProductForm'

export const dynamic = 'force-dynamic'

export default async function AlbSuAritmaYeniUrunPage() {
  const [rawBrands, rawCategories] = await Promise.all([
    getBrandsForAdmin(),
    getCategoriesForAdmin(),
  ])

  const brands = rawBrands.map((b) => ({ id: b.id, key: b.key, name: b.name }))
  const categories = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    parentId: c.parentId,
    brand: { id: c.brand.id, key: c.brand.key, name: c.brand.name },
  }))

  const albSuBrand = rawBrands.find((b) => b.key === 'alb-su-aritma')

  async function handleCreate(formData: FormData) {
    'use server'
    // Sonucu DÖNDÜRMEK şart: aksiyon doğrulama hatasını sonuç nesnesiyle
    // bildiriyor, sarmalayıcı yutarsa form hatayı hiç göremez.
    return createProduct(formData)
  }

  return (
    <div className="space-y-6">
      <div>
        <a
          href="/admin/urunler/alb-su-aritma"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← ALB Su Teknolojileri Ürünlerine Dön
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Yeni ALB Su Teknolojileri Ürünü</h1>
      </div>

      <ProductForm
        brands={brands}
        categories={categories}
        action={handleCreate}
        submitLabel="Ürünü Kaydet"
        defaultValues={{ brandId: albSuBrand?.id }}
      />
    </div>
  )
}
