import { adminLogout } from '@/app/actions/admin'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
          <form action={adminLogout}>
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Çıkış Yap
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/admin/urunler/alb-tarim"
            className="block bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow border border-green-100 group"
          >
            <div className="text-3xl mb-3">🌿</div>
            <h2 className="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors">
              ALB Tarım
            </h2>
            <p className="text-sm text-gray-400 mt-1">Tarım ürünleri yönetimi</p>
          </a>

          <a
            href="/admin/urunler/alb-su-aritma"
            className="block bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow border border-blue-100 group"
          >
            <div className="text-3xl mb-3">💧</div>
            <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
              ALB Su Teknolojileri
            </h2>
            <p className="text-sm text-gray-400 mt-1">Su arıtma ürünleri yönetimi</p>
          </a>
        </div>
      </div>
    </div>
  )
}
