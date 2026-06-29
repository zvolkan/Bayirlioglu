import React from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  reviewCount?: number
}

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  reviewCount,
}: StarRatingProps) {
  const clampedRating = Math.min(Math.max(0, rating), maxRating)
  const filledCount = Math.round(clampedRating)
  const emptyCount = maxRating - filledCount

  return (
    <div
      className="inline-flex items-center gap-1"
      role="img"
      aria-label={`${clampedRating.toFixed(1)} / ${maxRating} yıldız${reviewCount !== undefined ? `, ${reviewCount} değerlendirme` : ''}`}
    >
      {/* Dolu yıldızlar */}
      {Array.from({ length: filledCount }, (_, i) => (
        <svg
          key={`full-${i}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={cn(sizeClasses[size], 'fill-yellow-400 stroke-yellow-400')}
          strokeWidth="1"
          aria-hidden="true"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}

      {/* Boş yıldızlar */}
      {Array.from({ length: emptyCount }, (_, i) => (
        <svg
          key={`empty-${i}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={cn(sizeClasses[size], 'fill-gray-200 stroke-gray-300')}
          strokeWidth="1"
          aria-hidden="true"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}

      {/* Sayısal değer */}
      {showValue && (
        <span className={cn('font-bold text-gray-800', textSizeClasses[size])}>
          {clampedRating.toFixed(1)}
        </span>
      )}

      {/* Yorum sayısı */}
      {reviewCount !== undefined && (
        <span className={cn('text-gray-400', textSizeClasses[size])}>
          ({reviewCount} yorum)
        </span>
      )}
    </div>
  )
}
