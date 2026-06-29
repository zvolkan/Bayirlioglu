'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'react-hot-toast'
import type { Product } from '@/lib/types'

interface AddToCartButtonProps {
  product: Product
  disabled?: boolean
  className?: string
  label?: string
  quantity?: number
}

export default function AddToCartButton({
  product,
  disabled = false,
  className = '',
  label = 'Sepete Ekle',
  quantity = 1,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const handleClick = () => {
    if (disabled) return
    addItem(product, quantity)
    toast.success(`${product.name} sepete eklendi`)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      {added ? '✓ Eklendi' : label}
    </button>
  )
}
