'use client'

import { useTransition } from 'react'
import { deleteProduct } from '@/app/actions/admin'

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return
    startTransition(async () => {
      await deleteProduct(id)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? '...' : 'Sil'}
    </button>
  )
}
