'use client'

import React, { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn, formatPrice, calculateDiscount } from '@/lib/utils'
import { BRAND } from '@/lib/constants'
import { useCartStore } from '@/store/cartStore'
import { toggleFavorite } from '@/app/actions/favorites'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  className?: string
  /** Kullanıcının favorilerinde mi (sunucudan gelir) */
  initialFavorite?: boolean
}

export default function ProductCard({
  product,
  className,
  initialFavorite = false,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [isPending, startTransition] = useTransition()

  // Sepet: tek kaynak Zustand store. Eskiden burası doğrudan
  // localStorage['cart'] anahtarına yazıyordu; gerçek sepet ise
  // localStorage['bayirlioglu-cart'] altında farklı bir yapıda tutuluyordu, bu
  // yüzden bu karttan eklenen ürün sepette hiç görünmüyordu.
  const addItem = useCartStore((state) => state.addItem)

  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0]
  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price
  const discountPercent = hasDiscount ? calculateDiscount(product.price, product.salePrice!) : 0
  const isOutOfStock = product.stock === 0

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(product, 1)
    toast.success(`${product.name} sepete eklendi`)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const next = !isFavorite
    setIsFavorite(next) // iyimser güncelleme

    startTransition(async () => {
      const result = await toggleFavorite(product.id)

      if (!result.ok) {
        setIsFavorite(!next) // geri al
        toast.error(
          result.reason === 'auth'
            ? 'Favorilere eklemek için giriş yapmalısınız.'
            : 'Favori güncellenemedi. Lütfen tekrar deneyin.',
        )
        return
      }

      setIsFavorite(result.isFavorite)
    })
  }

  return (
    <article
      className={cn(
        'bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden group hover-lift h-full flex flex-col',
        className
      )}
    >
      {/* ─── GÖRSEL ALANI ─────────────────────────────────────────────── */}
      <Link href={`/urunler/${product.slug}`} className="relative block aspect-square bg-gray-100 overflow-hidden">
        {/* GÖRSEL: /public/images/products/ klasörüne ürün görsellerini ekleyin */}
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            {/* GÖRSEL: /public/images/placeholder.png dosyasını ekleyin */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Hover'da görselin üstüne inen yumuşak karartma */}
        <span className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* İndirim badge — sağ üst */}
        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110">
            %-{discountPercent}
          </span>
        )}

        {/* Favori butonu — sağ üst köşe (indirim badge yoksa) */}
        <button
          onClick={handleToggleFavorite}
          disabled={isPending}
          className={cn(
            'absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm',
            'flex items-center justify-center shadow-sm transition-all duration-300',
            'hover:scale-110 active:scale-95',
            isFavorite ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500',
            'opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus:opacity-100 focus:translate-y-0'
          )}
          aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          aria-pressed={isFavorite}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Stok badge — sol alt */}
        {(isOutOfStock || product.stock <= 5) && (
          <div className="absolute bottom-2 left-2 z-10">
            {isOutOfStock ? (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Tükendi
              </span>
            ) : (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Son {product.stock} adet
              </span>
            )}
          </div>
        )}
      </Link>

      {/* ─── İÇERİK ───────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Kategori */}
        <p className="text-xs text-gray-400 uppercase tracking-wide truncate">
          {product.category.name}
        </p>

        {/* Ürün adı */}
        <Link
          href={`/urunler/${product.slug}`}
          className={cn(
            'font-semibold text-gray-900 line-clamp-2 transition-colors duration-150',
            BRAND.colors.navHover
          )}
        >
          {product.name}
        </Link>

        {/* Rating — sarı yıldızlar */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <svg
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < Math.round(product.rating)
                    ? 'fill-yellow-400 stroke-yellow-400'
                    : 'fill-gray-200 stroke-gray-300'
                )}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth="1"
                aria-hidden="true"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
          {product.reviewCount > 0 && (
            <span className="text-xs text-gray-400">({product.reviewCount} yorum)</span>
          )}
        </div>

        {/* Fiyat satırı */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          {hasDiscount ? (
            <>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
              <span className={cn('text-xl font-black', BRAND.colors.primaryText)}>
                {formatPrice(product.salePrice!)}
              </span>
            </>
          ) : (
            <span className={cn('text-xl font-black', BRAND.colors.primaryText)}>
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Sepete Ekle butonu */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            'btn-press w-full rounded-xl py-2.5 px-4 text-sm font-semibold text-white shadow-sm',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
            BRAND.colors.accentPrimary
          )}
        >
          {isOutOfStock ? 'Tükendi' : 'Sepete Ekle'}
        </button>
      </div>
    </article>
  )
}
