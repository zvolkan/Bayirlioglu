'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelOrder } from '@/app/actions/orders'

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [step, setStep] = useState<'idle' | 'confirm' | 'loading'>('idle')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCancel = async () => {
    setStep('loading')
    setError(null)
    try {
      await cancelOrder(orderId)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu.')
      setStep('idle')
    }
  }

  if (step === 'confirm') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Emin misiniz?</span>
        <button
          onClick={handleCancel}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
        >
          Evet, İptal Et
        </button>
        <button
          onClick={() => setStep('idle')}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Vazgeç
        </button>
      </div>
    )
  }

  return (
    <div>
      {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
      <button
        onClick={() => setStep('confirm')}
        disabled={step === 'loading'}
        className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
      >
        {step === 'loading' ? 'İptal ediliyor...' : '✕ Siparişi İptal Et'}
      </button>
    </div>
  )
}
