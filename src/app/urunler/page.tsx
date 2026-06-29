'use client'

import dynamic from 'next/dynamic'

const UrunlerContent = dynamic(() => import('./UrunlerContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Yükleniyor...</p>
    </div>
  ),
})

export default function UrunlerPage() {
  return <UrunlerContent />
}
