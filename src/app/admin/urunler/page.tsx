import Link from 'next/link'
import { getProductsForAdmin, toggleProductActive, toggleProductFeatured } from '@/app/actions/admin'
import DeleteButton from './_components/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminUrunlerPage() {
  const products = await getProductsForAdmin()

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} ürün</p>
        </div>
        <Link
          href="/admin/urunler/yeni"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
        >
          + Yeni Ürün
        </Link>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Görsel
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Marka
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aktif
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Öne Çıkan
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const primaryImage = product.images[0]
                const price = Number(product.price)
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    {/* Görsel */}
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {primaryImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={primaryImage.url}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-gray-300 text-xl">📦</span>
                        )}
                      </div>
                    </td>

                    {/* Ürün adı + slug */}
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{product.slug}</p>
                    </td>

                    {/* Marka */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.brand.key === 'alb-tarim'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {product.brand.name}
                      </span>
                    </td>

                    {/* Fiyat */}
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                      {price.toLocaleString('tr-TR')} ₺
                    </td>

                    {/* Stok */}
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stockQuantity === 0 ? 'text-red-500' : 'text-gray-800'}`}>
                        {product.stockQuantity} {product.unit}
                      </span>
                    </td>

                    {/* Aktif toggle */}
                    <td className="px-4 py-3">
                      <form action={toggleProductActive.bind(null, product.id, product.isActive)}>
                        <button
                          type="submit"
                          className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
                            product.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          title={product.isActive ? 'Pasif yap' : 'Aktif yap'}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                              product.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </form>
                    </td>

                    {/* Öne çıkan toggle */}
                    <td className="px-4 py-3">
                      <form action={toggleProductFeatured.bind(null, product.id, product.isFeatured)}>
                        <button
                          type="submit"
                          className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
                            product.isFeatured ? 'bg-yellow-400' : 'bg-gray-300'
                          }`}
                          title={product.isFeatured ? 'Öne çıkarmayı kaldır' : 'Öne çıkar'}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                              product.isFeatured ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </form>
                    </td>

                    {/* İşlemler */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/urunler/${product.id}/duzenle`}
                          className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Düzenle
                        </Link>
                        <DeleteButton id={product.id} name={product.name} />
                      </div>
                    </td>
                  </tr>
                )
              })}

              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                    Henüz ürün eklenmemiş.
                    <Link href="/admin/urunler/yeni" className="text-blue-600 hover:underline ml-1">
                      İlk ürünü ekle →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
