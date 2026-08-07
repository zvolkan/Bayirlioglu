import Link from 'next/link'
import { getOrdersForAdmin, getOrderCountsByStatus } from '@/app/actions/admin-orders'
import { formatOrderNo } from '@/lib/order-number'

export const dynamic = 'force-dynamic'

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Ödeme Bekliyor', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Onaylandı', color: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'Hazırlanıyor', color: 'bg-purple-100 text-purple-700' },
  SHIPPED: { label: 'Kargoda', color: 'bg-indigo-100 text-indigo-700' },
  DELIVERED: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'İptal', color: 'bg-red-100 text-red-700' },
  REFUNDED: { label: 'İade', color: 'bg-gray-100 text-gray-700' },
}

const FILTERS = [
  { value: '', label: 'Tümü' },
  { value: 'CONFIRMED', label: 'Onaylandı' },
  { value: 'PROCESSING', label: 'Hazırlanıyor' },
  { value: 'SHIPPED', label: 'Kargoda' },
  { value: 'DELIVERED', label: 'Teslim Edildi' },
  { value: 'PENDING', label: 'Ödeme Bekliyor' },
  { value: 'CANCELLED', label: 'İptal' },
  { value: 'REFUNDED', label: 'İade' },
]

function formatPrice(value: unknown) {
  return Number(value).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export default async function AdminSiparislerPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string; ara?: string; sayfa?: string }>
}) {
  const params = await searchParams
  const page = Number(params.sayfa) || 1

  const [{ orders, total, pageCount }, counts] = await Promise.all([
    getOrdersForAdmin({ status: params.durum, search: params.ara, page }),
    getOrderCountsByStatus(),
  ])

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    const merged = { durum: params.durum, ara: params.ara, sayfa: undefined, ...overrides }
    for (const [key, value] of Object.entries(merged)) {
      if (value) sp.set(key, value)
    }
    const qs = sp.toString()
    return `/admin/siparisler${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
            ← Admin Paneli
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Siparişler</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} sipariş</p>
        </div>
      </div>

      {/* Durum filtreleri */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = (params.durum ?? '') === filter.value
          const count = filter.value ? (counts[filter.value] ?? 0) : total
          return (
            <Link
              key={filter.value || 'all'}
              href={buildHref({ durum: filter.value || undefined })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                isActive
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {filter.label}
              <span className={`ml-1.5 ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Arama */}
      <form className="flex gap-2" action="/admin/siparisler">
        {params.durum && <input type="hidden" name="durum" value={params.durum} />}
        <input
          name="ara"
          defaultValue={params.ara ?? ''}
          placeholder="Sipariş no, müşteri adı, e-posta veya takip no"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
        <button
          type="submit"
          className="btn-press px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700"
        >
          Ara
        </button>
      </form>

      {/* Liste */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-500">Bu filtreye uyan sipariş yok.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Sipariş</th>
                  <th className="text-left font-semibold px-4 py-3">Müşteri</th>
                  <th className="text-left font-semibold px-4 py-3">Marka</th>
                  <th className="text-right font-semibold px-4 py-3">Tutar</th>
                  <th className="text-left font-semibold px-4 py-3">Durum</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const meta = STATUS_META[order.status] ?? {
                    label: order.status,
                    color: 'bg-gray-100 text-gray-700',
                  }
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-gray-900">{formatOrderNo(order)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(order.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {order.shipFullName ?? order.user.name ?? '—'}
                        </p>
                        <p className="text-xs text-gray-400">{order.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.brand.name}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-1 rounded-full ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                        {order.trackingNumber && (
                          <p className="text-[11px] text-gray-400 mt-1 font-mono">
                            {order.trackingNumber}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/siparisler/${order.id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Detay →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="sm:hidden px-4 py-2.5 text-[11px] text-gray-400 border-t border-gray-100">
            Tüm sütunları görmek için tabloyu yana kaydırın →
          </p>
        </div>
      )}

      {/* Sayfalama */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildHref({ sayfa: String(page - 1) })}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-400"
            >
              ← Önceki
            </Link>
          )}
          <span className="text-sm text-gray-500 px-3">
            Sayfa {page} / {pageCount}
          </span>
          {page < pageCount && (
            <Link
              href={buildHref({ sayfa: String(page + 1) })}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-400"
            >
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
