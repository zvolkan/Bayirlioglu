'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BRAND, ACTIVE_BRAND_KEY, ORDER_STATUS_LABELS } from '@/lib/constants'
import { cn, formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  email: 'ahmet.yilmaz@email.com',
  phone: '0532 123 45 67',
  totalOrders: 3,
  totalSpent: 2450,
  points: 245,
}

const MOCK_RECENT_ORDERS = [
  { id: 'ORD-123456-001', date: '2024-06-15', items: 3, total: 1250, status: 'delivered' as const },
  { id: 'ORD-123456-002', date: '2024-06-01', items: 1, total: 459, status: 'shipped' as const },
  { id: 'ORD-123456-003', date: '2024-05-20', items: 2, total: 741, status: 'processing' as const },
]

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

const primaryColor = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'text-green-600' : 'text-blue-600'
const primaryBg = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'bg-green-600' : 'bg-blue-600'
const primaryLight = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'

function AccountSidebar({ active }: { active: string }) {
  const router = useRouter()
  const links = [
    { href: '/hesabim', label: 'Hesabım', icon: '👤' },
    { href: '/hesabim/siparislerim', label: 'Siparişlerim', icon: '📦' },
    { href: '/hesabim/adreslerim', label: 'Adreslerim', icon: '📍' },
    { href: '/hesabim/favorilerim', label: 'Favorilerim', icon: '❤️' },
  ]
  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={cn('p-6', primaryBg)}>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold mb-3">
            {MOCK_USER.firstName[0]}{MOCK_USER.lastName[0]}
          </div>
          <p className="text-white font-semibold">{MOCK_USER.firstName} {MOCK_USER.lastName}</p>
          <p className="text-white/70 text-sm">{MOCK_USER.email}</p>
        </div>
        <nav className="p-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                active === link.href ? primaryLight : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => router.push('/giris')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
          >
            <span>🚪</span>
            Çıkış Yap
          </button>
        </nav>
      </div>
    </aside>
  )
}

// ─── PROFILE FORM ─────────────────────────────────────────────────────────────

function ProfileForm() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    firstName: MOCK_USER.firstName,
    lastName: MOCK_USER.lastName,
    email: MOCK_USER.email,
    phone: MOCK_USER.phone,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Ad</label>
          <input
            className="form-input"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label">Soyad</label>
          <input
            className="form-input"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="form-label">E-posta</label>
        <input
          type="email"
          className="form-input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Telefon</label>
        <input
          type="tel"
          className="form-input"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className={cn('px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors', primaryBg,
            ACTIVE_BRAND_KEY === 'alb-tarim' ? 'hover:bg-green-500' : 'hover:bg-blue-500'
          )}
        >
          Değişiklikleri Kaydet
        </button>
        {saved && <span className="text-green-600 text-sm font-medium">✓ Kaydedildi!</span>}
      </div>
    </form>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function HesabimPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">Ana Sayfa</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Hesabım</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar active="/hesabim" />

          <div className="flex-1 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Toplam Sipariş', value: MOCK_USER.totalOrders, icon: '📦' },
                { label: 'Toplam Harcama', value: formatPrice(MOCK_USER.totalSpent), icon: '💳' },
                { label: 'Puan Bakiyem', value: MOCK_USER.points, icon: '⭐' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Son Siparişler</h2>
                <Link href="/hesabim/siparislerim" className={cn('text-sm font-medium', primaryColor)}>
                  Tümünü Gör →
                </Link>
              </div>
              <div className="space-y-3">
                {MOCK_RECENT_ORDERS.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.date)} · {order.items} ürün</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</span>
                      <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', getOrderStatusColor(order.status as any))}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Edit */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Profil Bilgileri</h2>
              <ProfileForm />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/hesabim/siparislerim"
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">📦</span>
                <div>
                  <p className="font-semibold text-gray-900">Siparişlerim</p>
                  <p className="text-sm text-gray-500">{MOCK_USER.totalOrders} sipariş</p>
                </div>
              </Link>
              <Link
                href="/hesabim/adreslerim"
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">📍</span>
                <div>
                  <p className="font-semibold text-gray-900">Adreslerim</p>
                  <p className="text-sm text-gray-500">2 kayıtlı adres</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
