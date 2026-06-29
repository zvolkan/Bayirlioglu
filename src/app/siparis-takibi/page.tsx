'use client'

import { useState } from 'react'
import { BRAND } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface StepInfo {
  id: number
  label: string
  icon: string
  date?: string
}

const STEPS: StepInfo[] = [
  { id: 1, label: 'Sipariş Alındı', icon: '📋', date: '28 Haz 2026, 14:32' },
  { id: 2, label: 'Onaylandı', icon: '✅', date: '28 Haz 2026, 15:10' },
  { id: 3, label: 'Hazırlanıyor', icon: '📦', date: '29 Haz 2026, 09:45' },
  { id: 4, label: 'Kargoya Verildi', icon: '🚚', date: undefined },
  { id: 5, label: 'Teslim Edildi', icon: '🏠', date: undefined },
]

const ACTIVE_STEP = 3 // stub: "Hazırlanıyor" aktif

const MOCK_CARGO = {
  company: 'Yurtiçi Kargo',
  trackingNo: 'YK2026062900123',
  orderNo: 'ALB-2026-00781',
}

export default function SiparisTakibiPage() {
  const [orderNum, setOrderNum] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<typeof MOCK_CARGO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNum.trim() || !email.trim()) {
      setError('Lütfen tüm alanları doldurun.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    await new Promise((res) => setTimeout(res, 1500))
    setLoading(false)
    // Stub: her sorgu için aynı mock sonuç
    setResult(MOCK_CARGO)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Sipariş Takibi</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Sipariş numaranızı ve e-posta / telefon bilginizi girerek siparişinizi sorgulayın.
          </p>
        </div>

        {/* Sorgulama Formu */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm p-6 mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sipariş No
              </label>
              <input
                type="text"
                value={orderNum}
                onChange={(e) => setOrderNum(e.target.value)}
                placeholder="Örn: ALB-2026-00781"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                E-posta veya Telefon
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com veya 05xx..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 mb-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed',
              BRAND.colors.primary,
              BRAND.colors.primaryHover
            )}
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sorgulanıyor...
              </>
            ) : (
              '🔍 Siparişi Sorgula'
            )}
          </button>
        </form>

        {/* Sonuç */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {/* Sipariş Bilgisi */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Sipariş No</p>
                <p className="font-bold text-gray-900">{result.orderNo}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Kargo Şirketi</p>
                <p className="font-semibold text-gray-800">{result.company}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Takip No</p>
                <p className={cn('font-semibold', BRAND.colors.primaryText)}>
                  {result.trackingNo}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <h2 className="text-base font-bold text-gray-900 mb-6">Sipariş Durumu</h2>
            <div className="relative">
              {/* Dikey çizgi */}
              <div className="absolute left-5 top-4 bottom-4 w-px bg-gray-200" />

              <div className="space-y-6">
                {STEPS.map((step) => {
                  const isDone = step.id < ACTIVE_STEP
                  const isActive = step.id === ACTIVE_STEP
                  const isFuture = step.id > ACTIVE_STEP

                  return (
                    <div key={step.id} className="relative flex items-start gap-4">
                      {/* Adım noktası */}
                      <div
                        className={cn(
                          'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg border-2 transition-all',
                          isDone
                            ? `${BRAND.colors.primary} border-transparent text-white`
                            : isActive
                            ? `bg-white ${BRAND.colors.primaryBorder} text-gray-800 shadow-md ring-4 ring-offset-0`
                            : 'bg-gray-100 border-gray-200 text-gray-300'
                        )}
                        style={isActive ? { '--tw-ring-color': '#bbf7d0' } as React.CSSProperties : undefined}
                      >
                        {isDone ? '✓' : step.icon}
                      </div>

                      {/* İçerik */}
                      <div className="flex-1 pt-1.5">
                        <p
                          className={cn(
                            'font-semibold text-sm',
                            isDone
                              ? 'text-gray-500'
                              : isActive
                              ? 'text-gray-900'
                              : 'text-gray-300'
                          )}
                        >
                          {step.label}
                          {isActive && (
                            <span className={cn('ml-2 text-xs font-bold px-2 py-0.5 rounded-full', BRAND.colors.primaryLight, BRAND.colors.primaryText)}>
                              Aktif
                            </span>
                          )}
                        </p>
                        {step.date && (
                          <p className="text-xs text-gray-400 mt-0.5">{step.date}</p>
                        )}
                        {isActive && step.id === 3 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Siparişiniz depomuzda hazırlanmaktadır. En kısa sürede kargoya verilecek.
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Kargo takip linki */}
            <div className={cn('mt-8 rounded-xl p-4 flex items-center justify-between gap-3', BRAND.colors.primaryLight, BRAND.colors.primaryBorder, 'border')}>
              <div>
                <p className="text-sm font-semibold text-gray-800">{result.company} ile takip edin</p>
                <p className={cn('text-sm font-mono font-bold mt-0.5', BRAND.colors.primaryText)}>
                  {result.trackingNo}
                </p>
              </div>
              <a
                href={`https://www.yurticikargo.com/tr/online-islemler/gonderi-sorgula?code=${result.trackingNo}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors',
                  BRAND.colors.primary,
                  BRAND.colors.primaryHover
                )}
              >
                Takip Et →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
