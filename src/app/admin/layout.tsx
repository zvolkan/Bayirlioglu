import type { Metadata } from 'next'
import { adminLogout } from '@/app/actions/admin'

export const metadata: Metadata = {
  title: 'Admin Paneli — Bayırlıoğlu',
  robots: 'noindex, nofollow',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Üst Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-gray-800">🛠️ Admin Paneli</span>
            <nav className="flex gap-4 ml-6">
              <a
                href="/admin/urunler"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Ürünler
              </a>
            </nav>
          </div>

          <form action={adminLogout}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Çıkış Yap
            </button>
          </form>
        </div>
      </header>

      {/* İçerik */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
