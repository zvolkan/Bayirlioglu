import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { verifyAdminToken } from '@/lib/admin-auth'

export const metadata: Metadata = {
  title: 'Admin Paneli — Bayırlıoğlu',
  robots: 'noindex, nofollow',
}

/**
 * Admin bölümünün ikinci koruma katmanı.
 *
 * Middleware zaten /admin/* yolunu koruyor, ancak sayfa seviyesinde kontrol
 * olmadığında yetkisiz istek "Yetkisiz erişim" hatasıyla genel hata ekranına
 * düşüyordu. Burada giriş sayfasına düzgün yönlendirme yapılır.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()])

  const pathname = headerList.get('x-pathname')

  // Başlık yoksa (middleware çalışmamışsa) koruma atlanır — birincil koruma
  // middleware'dedir ve burada yönlendirme döngüsüne girmek istemiyoruz.
  const shouldGuard = pathname !== null && !pathname.startsWith('/admin/giris')

  if (shouldGuard) {
    const token = cookieStore.get('admin_session')?.value
    if (!(await verifyAdminToken(token))) {
      redirect('/admin/giris')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
