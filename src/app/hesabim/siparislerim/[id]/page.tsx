import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import CancelOrderButton from '../_components/CancelOrderButton'
import RepeatOrderButton from '../../_components/RepeatOrderButton'
import type { BrandKey } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Sipariş Detayı | Bayırlıoğlu Grup',
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:    { label: 'Beklemede',       color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '⏳' },
  CONFIRMED:  { label: 'Onaylandı',       color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: '✅' },
  PROCESSING: { label: 'Hazırlanıyor',    color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '📋' },
  SHIPPED:    { label: 'Kargoya Verildi', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '🚚' },
  DELIVERED:  { label: 'Teslim Edildi',   color: 'bg-green-100 text-green-700 border-green-200',    icon: '✓' },
  CANCELLED:  { label: 'İptal Edildi',    color: 'bg-red-100 text-red-700 border-red-200',           icon: '✕' },
  REFUNDED:   { label: 'İade Edildi',     color: 'bg-gray-100 text-gray-700 border-gray-200',        icon: '↩' },
}

const PAYMENT_LABELS: Record<string, string> = {
  credit_card:      'Kredi / Banka Kartı',
  bank_transfer:    'Havale / EFT',
  cash_on_delivery: 'Kapıda Ödeme',
  iyzico:           'Kredi / Banka Kartı (İyzico)',
}

function formatPrice(value: unknown): string {
  return Number(value).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(date))
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function SiparisDetayPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/giris')

  const order = await prisma.order.findFirst({
    where: { id, userId: authUser.id },
    include: {
      brand: { select: { name: true, key: true } },
      address: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              unit: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
  })

  if (!order) notFound()

  const status = STATUS_MAP[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '?' }
  const isAlbTarim = order.brand.key === 'alb-tarim'
  const cancellable = ['PENDING', 'CONFIRMED'].includes(order.status)
  const shipped = ['SHIPPED', 'DELIVERED'].includes(order.status)
  const delivered = order.status === 'DELIVERED'

  const addr = order.address

  const KARGO_UCRETI = 29.90
  const KARGO_LIMIT = 500
  const subtotal = Number(order.totalAmount)
  const cargoFee = subtotal >= KARGO_LIMIT ? 0 : KARGO_UCRETI

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/hesabim/siparislerim"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tüm Siparişler
          </Link>
          <span className="text-xs text-gray-400 font-mono">#{order.id.slice(-8).toUpperCase()}</span>
        </div>

        {/* Order summary header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h1 className="text-base font-bold text-gray-900 mb-3">Sipariş Özeti</h1>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Sipariş No</p>
                <p className="font-semibold text-gray-900 font-mono text-xs">{order.id.slice(-10).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Sipariş Tarihi</p>
                <p className="font-semibold text-gray-900 text-xs">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Paket Detayları</p>
                <p className="font-semibold text-gray-900 text-xs">{order.items.length} ürün</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Durumu</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>
                  {status.icon} {status.label}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons row */}
          <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3 bg-gray-50">
            <span className="text-xs text-gray-500 mr-1">Satıcı: <strong className="text-gray-700">{order.brand.name}</strong></span>
            <div className="flex flex-wrap gap-2 ml-auto">
              {delivered && (
                <button
                  disabled
                  title="Yakında aktif olacak"
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed font-medium"
                >
                  📦 İade Kargo Kodu Oluştur
                </button>
              )}
              <button
                disabled
                title="Fatura henüz hazır değil"
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed font-medium"
              >
                🧾 Fatura Görüntüle
              </button>
              {isAlbTarim && (
                <RepeatOrderButton orderId={order.id} brandKey={order.brand.key as BrandKey} />
              )}
            </div>
          </div>
        </div>

        {/* Delivery status */}
        {(shipped || delivered) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${delivered ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'} font-bold text-sm`}>
                {delivered ? '✓' : '🚚'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${delivered ? 'text-green-700' : 'text-indigo-700'}`}>
                  {delivered ? 'Teslim Edildi' : 'Kargoya Verildi'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {delivered
                    ? 'Siparişiniz teslim edilmiştir.'
                    : 'Siparişiniz kargoya verilmiştir. Kargo takip numarası için satıcıyla iletişime geçin.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Ürünler</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item) => {
              const img = item.product.images[0]?.url
              return (
                <div key={item.id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
                  {/* Product image */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={item.product.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{item.product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.quantity} {item.product.unit} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>

                  {/* Item total */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">{formatPrice(item.totalPrice)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Price summary */}
          <div className="px-4 sm:px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Ara Toplam</span>
              <span>{formatPrice(subtotal >= KARGO_LIMIT ? subtotal : subtotal - cargoFee)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Kargo</span>
              <span className={cargoFee === 0 ? 'text-green-600 font-medium' : ''}>
                {cargoFee === 0 ? 'Ücretsiz' : formatPrice(cargoFee)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Toplam (KDV dahil)</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Bottom info cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {/* Shipping address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Teslimat Adresi</h3>
            {addr ? (
              <div className="text-sm text-gray-700 space-y-0.5">
                <p className="font-semibold">{addr.fullName}</p>
                <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p>{addr.district} / {addr.city}</p>
                {addr.postalCode && <p className="text-gray-400">{addr.postalCode}</p>}
                <p className="text-gray-500">{addr.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Adres bilgisi bulunamadı.</p>
            )}
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ödeme Bilgileri</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Ödeme Yöntemi</span>
                <span className="font-medium">
                  {PAYMENT_LABELS[order.paymentMethod ?? ''] ?? order.paymentMethod ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ödeme Durumu</span>
                <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-gray-700'}`}>
                  {order.paymentStatus === 'paid'    ? 'Ödendi'
                    : order.paymentStatus === 'failed' ? 'Başarısız'
                    : order.paymentStatus === 'refunded' ? 'İade Edildi'
                    : 'Bekliyor'}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-100 font-bold">
                <span>Toplam</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel order */}
        {cancellable && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Siparişi İptal Et</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sipariş henüz hazırlanmaya başlanmadı. İptal edebilirsiniz.
                </p>
              </div>
              <CancelOrderButton orderId={order.id} isPaid={order.paymentStatus === 'paid'} />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
