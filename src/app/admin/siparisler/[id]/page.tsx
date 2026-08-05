import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import OrderControls from './_components/OrderControls'

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

function formatPrice(value: unknown) {
  return Number(value).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
}

function formatDate(date: Date | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export default async function AdminSiparisDetayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Sayfa seviyesinde ikinci koruma katmanı
  const cookieStore = await cookies()
  if (!(await verifyAdminToken(cookieStore.get('admin_session')?.value))) {
    redirect('/admin/giris?redirect=/admin/siparisler')
  }

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true, phone: true } },
      brand: { select: { name: true, key: true } },
      address: true,
      items: {
        include: {
          product: { select: { name: true, slug: true, unit: true, stockQuantity: true } },
        },
      },
    },
  })

  if (!order) notFound()

  const meta = STATUS_META[order.status] ?? {
    label: order.status,
    color: 'bg-gray-100 text-gray-700',
  }

  const itemsTotal = order.items.reduce(
    (sum: number, item: { totalPrice: unknown }) => sum + Number(item.totalPrice),
    0,
  )

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/siparisler" className="text-sm text-gray-500 hover:text-gray-700">
          ← Siparişlere Dön
        </Link>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Sipariş Detayı</h1>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.color}`}>
            {meta.label}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1 font-mono">{order.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: ürünler + tutar */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 border-b pb-3 mb-4">Ürünler</h2>
            <div className="space-y-3">
              {order.items.map(
                (item: {
                  id: string
                  quantity: number
                  unitPrice: unknown
                  totalPrice: unknown
                  product: { name: string; unit: string; stockQuantity: number }
                }) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.quantity} {item.product.unit} × {formatPrice(item.unitPrice)}
                        <span className="ml-2 text-gray-300">|</span>
                        <span className="ml-2">Kalan stok: {item.product.stockQuantity}</span>
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 whitespace-nowrap">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                ),
              )}
            </div>

            <div className="border-t mt-5 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam</span>
                <span>{formatPrice(order.subtotal ?? itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Kargo</span>
                <span>
                  {Number(order.shippingFee ?? 0) === 0
                    ? 'Ücretsiz'
                    : formatPrice(order.shippingFee)}
                </span>
              </div>
              {order.taxAmount != null && Number(order.taxAmount) > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Bunun KDV&apos;si</span>
                  <span>{formatPrice(order.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
                <span>Toplam (KDV dahil)</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </section>

          {/* Teslimat adresi — sipariş anındaki kopya */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 border-b pb-3 mb-4">Teslimat Adresi</h2>
            {order.shipFullName ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shipFullName}</p>
                <p>{order.shipPhone}</p>
                <p>
                  {order.shipLine1}
                  {order.shipLine2 ? `, ${order.shipLine2}` : ''}
                </p>
                <p>
                  {order.shipDistrict} / {order.shipCity}
                  {order.shipPostalCode ? ` — ${order.shipPostalCode}` : ''}
                </p>
              </div>
            ) : order.address ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.address.fullName}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.line1}</p>
                <p>
                  {order.address.district} / {order.address.city}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Adres bilgisi bulunamadı.</p>
            )}
          </section>

          {/* Fatura bilgileri — e-arşiv fatura kesmek için gerekli.
              Bu alanlar ödeme adımında toplanıyordu ama hiçbir admin ekranında
              gösterilmiyordu; operasyon ekibi VKN'yi göremiyordu. */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 border-b pb-3 mb-4">Fatura Bilgileri</h2>
            {order.invoiceType ? (
              <dl className="text-sm space-y-2.5">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500 shrink-0">Fatura Tipi</dt>
                  <dd className="font-medium text-gray-900 text-right">
                    {order.invoiceType === 'kurumsal' ? 'Kurumsal' : 'Bireysel'}
                  </dd>
                </div>

                {order.invoiceTitle && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500 shrink-0">Ticaret Unvanı</dt>
                    <dd className="font-medium text-gray-900 text-right">{order.invoiceTitle}</dd>
                  </div>
                )}

                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500 shrink-0">
                    {order.invoiceType === 'kurumsal' ? 'Vergi Kimlik No' : 'TC Kimlik No'}
                  </dt>
                  <dd className="font-mono font-medium text-gray-900 text-right">
                    {order.invoiceTaxId || '—'}
                  </dd>
                </div>

                {order.invoiceTaxOffice && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500 shrink-0">Vergi Dairesi</dt>
                    <dd className="font-medium text-gray-900 text-right">
                      {order.invoiceTaxOffice}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500 shrink-0">Fatura E-postası</dt>
                  <dd className="font-medium text-gray-900 text-right break-all">
                    {order.invoiceEmail || order.user.email}
                  </dd>
                </div>

                {order.contractAcceptedAt && (
                  <div className="flex justify-between gap-4 pt-2 border-t">
                    <dt className="text-gray-500 shrink-0">Sözleşme Onayı</dt>
                    <dd className="text-gray-500 text-right text-xs">
                      {formatDate(order.contractAcceptedAt)}
                      {order.contractIp ? ` · ${order.contractIp}` : ''}
                      {order.contractVersion ? ` · v${order.contractVersion}` : ''}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-gray-400">
                Bu sipariş fatura bilgisi toplanmadan önce oluşturulmuş.
              </p>
            )}
          </section>
        </div>

        {/* Sağ: müşteri + işlemler */}
        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 border-b pb-3 mb-4">Müşteri</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium text-gray-900">{order.user.name ?? '—'}</p>
              <p className="break-all">{order.user.email}</p>
              {order.user.phone && <p>{order.user.phone}</p>}
              <p className="text-xs text-gray-400 pt-2 border-t">
                Marka: {order.brand.name}
                <br />
                Sipariş: {formatDate(order.createdAt)}
                <br />
                Ödeme: {order.paymentStatus ?? '—'}
                {order.shippedAt && (
                  <>
                    <br />
                    Kargoya veriliş: {formatDate(order.shippedAt)}
                  </>
                )}
                {order.deliveredAt && (
                  <>
                    <br />
                    Teslim: {formatDate(order.deliveredAt)}
                  </>
                )}
              </p>
            </div>
          </section>

          <OrderControls
            orderId={order.id}
            status={order.status}
            carrier={order.carrier}
            trackingNumber={order.trackingNumber}
            adminNote={order.adminNote}
            canRefund={order.paymentStatus === 'paid' && order.status !== 'REFUNDED'}
          />
        </div>
      </div>
    </div>
  )
}
