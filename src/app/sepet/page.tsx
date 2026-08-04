'use client'

import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { formatPrice, cn } from '@/lib/utils'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Package } from 'lucide-react'
import { KARGO_LIMIT as CARGO_THRESHOLD, calculateTotals } from '@/lib/checkout'

export default function SepetPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCart()

  // Tutar hesabı tek kaynaktan (src/lib/checkout.ts) — ödeme sayfası ve sipariş
  // detayı da aynı fonksiyonu kullanır, böylece rakamlar birbirini tutar.
  const { subtotal, shippingFee: cargoFee, total } = calculateTotals(getTotalPrice())

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz boş</h1>
          <p className="text-gray-500 text-sm mb-8">
            Henüz sepetinize ürün eklemediniz. Alışverişe başlamak için ürünlerimize göz atın.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/alb-tarim/urunler"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              <Package className="w-4 h-4" />
              ALB Tarım Ürünleri
            </Link>
            <Link
              href="/alb-su-aritma/urunler"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              <Package className="w-4 h-4" />
              Alb Su Teknolojileri Ürünleri
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Sepetim
            <span className="ml-2 text-base font-normal text-gray-400">
              ({items.length} ürün)
            </span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.product.salePrice ?? item.product.price
              const lineTotal = price * item.quantity
              return (
                <div
                  key={item.product.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex gap-4"
                >
                  {/* Image placeholder */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.product.images?.[0] ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {item.product.name}
                        </h3>
                        {item.product.unit && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.product.unit}</p>
                        )}
                        <p className="text-sm font-medium text-blue-600 mt-1">
                          {formatPrice(price)}
                          {item.product.salePrice && (
                            <span className="ml-2 text-xs text-gray-400 line-through font-normal">
                              {formatPrice(item.product.price)}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Ürünü kaldır"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity + Line total */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(item.product.id, item.quantity - 1)
                              : removeItem(item.product.id)
                          }
                          className="p-2 hover:bg-gray-50 transition-colors"
                          aria-label="Azalt"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <span className="px-3 text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            item.quantity < item.product.stock
                              ? updateQuantity(item.product.id, item.quantity + 1)
                              : undefined
                          }
                          disabled={item.quantity >= item.product.stock}
                          className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Artır"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatPrice(lineTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Continue shopping */}
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Alışverişe Devam Et
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4">Sipariş Özeti</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span
                    className={cn(
                      'font-medium',
                      cargoFee === 0 ? 'text-green-600' : 'text-gray-900'
                    )}
                  >
                    {cargoFee === 0 ? 'Ücretsiz' : formatPrice(cargoFee)}
                  </span>
                </div>
                {subtotal < CARGO_THRESHOLD && (
                  <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                    <span className="font-semibold">{formatPrice(CARGO_THRESHOLD - subtotal)}</span> daha ekleyin, kargo ücretsiz olsun!
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-gray-900">Toplam</span>
                    <span className="block text-xs text-gray-400 font-normal">KDV dahil</span>
                  </div>
                  <span className="font-bold text-lg text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/odeme"
                className="mt-5 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Siparişi Tamamla
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-xs text-gray-400 text-center mt-3">
                Güvenli ödeme ile korunan alışveriş
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
