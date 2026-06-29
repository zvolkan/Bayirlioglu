'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'react-hot-toast'
import type { Product } from '@/lib/types'
import { BRAND } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface ProductActionsProps {
  product: Product
  whatsappUrl: string
}

export default function ProductActions({ product, whatsappUrl }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((s) => s.addItem)

  const isOutOfStock = product.stock === 0

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(product, quantity)
    toast.success(`${product.name} sepete eklendi (${quantity} adet)`)
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(product.stock, prev + delta)))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Miktar seçici */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700">Adet:</span>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isOutOfStock}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Azalt"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="w-12 text-center font-semibold text-gray-900 text-sm select-none">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= product.stock || isOutOfStock}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Artır"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        {product.stock > 0 && product.stock <= 10 && (
          <span className="text-xs text-amber-600 font-medium">Son {product.stock} adet!</span>
        )}
      </div>

      {/* CTA Butonları */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Sepete Ekle */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all',
            isOutOfStock
              ? 'bg-gray-300 cursor-not-allowed'
              : cn(BRAND.colors.accentPrimary, 'active:scale-95')
          )}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {isOutOfStock ? 'Stok Tükendi' : 'Sepete Ekle'}
        </button>

        {/* WhatsApp ile Sipariş */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1aad50] active:scale-95 text-white font-bold text-sm py-3.5 px-5 rounded-xl transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
      </div>

      {/* Hızlı Sipariş Notu */}
      {!isOutOfStock && (
        <p className="text-xs text-gray-400 text-center">
          🚚 Bugün sipariş ver, 1-3 iş günü içinde teslim al
        </p>
      )}
    </div>
  )
}
