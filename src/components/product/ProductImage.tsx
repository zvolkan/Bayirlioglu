'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  alt: string
  fallback?: string
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
}

export default function ProductImage({ src, alt, fallback = '📦', className, fill, sizes, priority }: Props) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <span className="text-[80px] opacity-40 select-none">{fallback}</span>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setError(true)}
    />
  )
}
