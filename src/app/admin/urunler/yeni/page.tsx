import { getBrandsForAdmin, getCategoriesForAdmin, createProduct } from '@/app/actions/admin'
import ProductForm from '../_components/ProductForm'

// Admin sayfaları her zaman dinamik render edilmeli — auth middleware cookie'ye
// dayanır ve statik derleme sırasında DB bağlantısı olmayabilir.
export const dynamic = 'force-dynamic'

export default async function YeniUrunPage() {
  const [rawBrands, rawCategories] = await Promise.all([
    getBrandsForAdmin(),
    getCategoriesForAdmin(),
  ])

  // Prisma nesnelerinden yalnızca Client Component'in ihtiyaç duyduğu alanları al.
  // Date / Decimal gibi RSC serileştirmesinde sorun çıkarabilecek alanlar atlanır.
  const brands = rawBrands.map((b) => ({ id: b.id, key: b.key, name: b.name }))
  const categories = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    brand: { id: c.brand.id, key: c.brand.key, name: c.brand.name },
  }))

  // Module-level server action'ları startTransition üzerinden çağırırken
  // Next.js 15 / React 19'da redirect() client-side exception'a yol açabiliyor.
  // Edit sayfasıyla aynı pattern: inline 'use server' wrapper kullan.
  async function handleCreate(formData: FormData) {
    'use server'
    await createProduct(formData)
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
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Yeni Ürün Ekle</h1>
      </div>

      <ProductForm
        brands={brands}
        categories={categories}
        action={handleCreate}
        submitLabel="Ürünü Kaydet"
      />
    </div>
  )
}
