import Link from 'next/link'
import ClearCart from './_components/ClearCart'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Siparişiniz Alındı | Bayırlıoğlu Grup',
  robots: { index: false, follow: false },
}


type Props = {
  searchParams: Promise<{ siparis?: string }>
}

export default async function BasariliPage({ searchParams }: Props) {
  const { siparis } = await searchParams

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <ClearCart />
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">

        {/* Checkmark */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Siparişiniz Alındı!
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanıp kargoya verilecektir.
        </p>

        {siparis && (
          <div className="bg-gray-50 rounded-xl px-5 py-3 mb-6">
            <p className="text-xs text-gray-400 mb-0.5">Sipariş Numaranız</p>
            <p className="font-mono font-semibold text-gray-900 text-sm tracking-wider">
              #{siparis.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        <p className="text-xs text-gray-400 mb-8">
          Sipariş durumunuzu <strong>Hesabım</strong> sayfasından takip edebilirsiniz.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/hesabim"
            className="flex-1 py-3 rounded-xl bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm text-center transition-colors"
          >
            Siparişlerimi Gör
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold text-sm text-center transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  )
}
