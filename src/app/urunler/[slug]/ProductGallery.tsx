'use client'

import { useState } from 'react'
import type { ProductImage } from '@/lib/types'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const activeImage = images[activeIndex]

  return (
    <div className="flex flex-col gap-4">
      {/* Ana görsel */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {activeImage ? (
          // GÖRSEL: {activeImage.url}
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImage.url}
            alt={activeImage.alt || productName}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              // Görsel yüklenemezse placeholder göster
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="text-8xl opacity-30">📦</div>
        )}

        {/* Önceki / Sonraki oklar */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Önceki görsel"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Sonraki görsel"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Sayaç */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full font-medium">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Küçük thumbnail'lar */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all bg-gray-100 flex items-center justify-center ${
                i === activeIndex
                  ? 'border-gray-900 shadow-md scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`Görsel ${i + 1}`}
            >
              {/* GÖRSEL: {img.url} */}
              <img
                src={img.url}
                alt={img.alt || `${productName} görsel ${i + 1}`}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
