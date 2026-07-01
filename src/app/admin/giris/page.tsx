import { adminLogin } from '@/app/actions/admin'

export default function AdminGirisPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Admin Girişi</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Bayırlıoğlu Yönetim Paneli</p>

        <AdminLoginForm />
      </div>
    </div>
  )
}

function AdminLoginForm() {
  async function login(formData: FormData) {
    'use server'
    return adminLogin(formData)
  }

  return (
    <form action={login} className="flex flex-col gap-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Admin şifresini girin"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors mt-2"
      >
        Giriş Yap
      </button>
    </form>
  )
}
