'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ACTIVE_BRAND_KEY, ORDER_STATUS_LABELS } from '@/lib/constants'
import { cn, formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import type { OrderStatus } from '@/lib/types'

const primaryColor = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'text-green-600' : 'text-blue-600'
const primaryBg = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'bg-green-600' : 'bg-blue-600'
const primaryLight = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'

const MOCK_ORDERS = [
  {
    id: 'ORD-123456-001',
    date: '2024-06-15',
    status: 'delivered' as OrderStatus,
    items: [
      { name: 'Organik Gübre 25kg', qty: 2, price: 450 },
      { name: 'Damla Sulama Başlığı', qty: 10, price: 35 },
    ],
    subtotal: 1150,
    cargo: 0,
    total: 1250,
    address: 'Atatürk Mah. Güneş Sok. No:5, Ankara',
    cargoCode: 'TK123456789',
  },
  {
    id: 'ORD-123456-002',
    date: '2024-06-01',
    status: 'shipped' as OrderStatus,
    items: [
      { name: 'Akıllı Sulama Kontrol Sistemi', qty: 1, price: 459 },
    ],
    subtotal: 459,
    cargo: 0,
    total: 459,
    address: 'Kızılay Cad. No:12, Ankara',
    cargoCode: 'TK987654321',
  },
  {
    id: 'ORD-123456-003',
    date: '2024-05-20',
    status: 'processing' as OrderStatus,
    items: [
      { name: 'Tarım İlacı Seti', qty: 1, price: 380 },
      { name: 'Koruyucu Maske', qty: 3, price: 120 },
    ],
    subtotal: 741,
    cargo: 29.90,
    total: 741,
    address: 'Bağlıca Mah. No:8, Ankara',
    cargoCode: null,
  },
]

const MOCK_USER = { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet.yilmaz@email.com' }

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

export default function SiparislerimPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">Ana Sayfa</Link>
          <span className="mx-2">/</span>
          <Link href="/hesabim" className="hover:text-gray-900">Hesabım</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Siparişlerim</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar active="/hesabim/siparislerim" />

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Siparişlerim</h1>
              <span className="text-sm text-gray-500">{MOCK_ORDERS.length} sipariş</span>
            </div>

            {MOCK_ORDERS.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn('text-xs px-3 py-1.5 rounded-full border font-medium', getOrderStatusColor(order.status))}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Order items */}
                <div className="px-6 py-4 space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-lg">
                          📦
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-gray-500">Adet: {item.qty}</p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                {/* Order footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">Teslimat: </span>
                    {order.address}
                  </div>
                  <div className="flex gap-2">
                    {order.cargoCode && (
                      <Link
                        href={`/siparis-takibi?no=${order.cargoCode}`}
                        className={cn('text-sm px-4 py-2 rounded-xl font-medium border transition-colors',
                          ACTIVE_BRAND_KEY === 'alb-tarim'
                            ? 'border-green-200 text-green-700 hover:bg-green-50'
                            : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                        )}
                      >
                        📦 Kargo Takip
                      </Link>
                    )}
                    <button className="text-sm px-4 py-2 rounded-xl font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                      Fatura İndir
                    </button>
                    {order.status === 'delivered' && (
                      <button className="text-sm px-4 py-2 rounded-xl font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                        Tekrar Sipariş Ver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
