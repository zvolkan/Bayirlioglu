import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { signOut } from '@/app/actions/auth'
import RepeatOrderButton from '../_components/RepeatOrderButton'

export const metadata: Metadata = {
  title: 'Siparişlerim | Bayırlıoğlu Grup',
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Beklemede',       color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED:  { label: 'Onaylandı',       color: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'Hazırlanıyor',    color: 'bg-purple-100 text-purple-700' },
  SHIPPED:    { label: 'Kargoya Verildi', color: 'bg-indigo-100 text-indigo-700' },
  DELIVERED:  { label: 'Teslim Edildi',   color: 'bg-green-100 text-green-700' },
  CANCELLED:  { label: 'İptal Edildi',    color: 'bg-red-100 text-red-700' },
  REFUNDED:   { label: 'İade Edildi',     color: 'bg-gray-100 text-gray-700' },
}

function formatPrice(value: unknown): string {
  return Number(value).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(date))
}

export default async function SiparislerimPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/giris')

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { name: true, phone: true },
  })

  const orders = await prisma.order.findMany({
    where: { userId: authUser.id },
    include: {
      brand: { select: { name: true, key: true } },
      address: {
        select: { fullName: true, line1: true, line2: true, district: true, city: true },
      },
      items: {
        include: {
          product: { select: { name: true, unit: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const userName = dbUser?.name ?? authUser.email ?? ''
  const initials = userName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const sidebarLinks = [
    { href: '/hesabim',              label: 'Hesabım',      icon: '👤' },
    { href: '/hesabim/siparislerim', label: 'Siparişlerim', icon: '📦' },
    { href: '/hesabim/adreslerim',   label: 'Adreslerim',   icon: '📍' },
    { href: '/hesabim/favorilerim',  label: 'Favorilerim',  icon: '❤️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">Ana Sayfa</Link>
          <span className="mx-2">/</span>
          <Link href="/hesabim" className="hover:text-gray-900">Hesabım</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Siparişlerim</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 bg-gray-900">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold mb-3">
                  {initials || '?'}
                </div>
                <p className="text-white font-semibold truncate">{dbUser?.name ?? '—'}</p>
                <p className="text-white/70 text-sm truncate">{authUser.email}</p>
              </div>
              <nav className="p-2">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      link.href === '/hesabim/siparislerim'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    <span>🚪</span>
                    Çıkış Yap
                  </button>
                </form>
              </nav>
            </div>
          </aside>

          {/* Orders */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Siparişlerim</h1>
              <span className="text-sm text-gray-500">{orders.length} sipariş</span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-4xl mb-4">📦</p>
                <p className="text-gray-500 text-sm mb-4">Henüz siparişiniz bulunmuyor.</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold transition-colors"
                >
                  Alışverişe Başla
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const status = STATUS_MAP[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-700' }
                  const brandColor = order.brand.key === 'alb-tarim' ? 'bg-green-600' : 'bg-blue-600'
                  const brandDot = order.brand.key === 'alb-tarim' ? 'bg-green-400' : 'bg-blue-400'
                  const addr = order.address
                  const addrText = addr
                    ? `${addr.line1}${addr.line2 ? ' ' + addr.line2 : ''}, ${addr.district} / ${addr.city}`
                    : null

                  return (
                    <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg ${brandColor} flex items-center justify-center text-xs`}>
                            {order.brand.key === 'alb-tarim' ? '🌾' : '💧'}
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="px-5 py-4 space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${brandDot}`} />
                            <span className="flex-1 truncate">{item.product.name}</span>
                            <span className="text-gray-400 flex-shrink-0">{item.quantity} {item.product.unit}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-gray-50 border-t border-gray-100">
                        {addrText ? (
                          <p className="text-xs text-gray-500 flex-1 min-w-0 truncate">
                            <span className="text-gray-400">Teslimat: </span>{addrText}
                          </p>
                        ) : (
                          <span />
                        )}
                        <div className="flex-shrink-0">
                          <RepeatOrderButton orderId={order.id} brandKey={order.brand.key} />
                        </div>
                      </div>

                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
