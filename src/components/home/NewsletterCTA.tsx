'use client'

import { useState } from 'react'
import { BRAND, ACTIVE_BRAND_KEY } from '@/lib/constants'
import { cn } from '@/lib/utils'

const isTarim = ACTIVE_BRAND_KEY === 'alb-tarim'

const TRUST_BADGES = [
  { icon: '🔒', label: 'Güvenli Ödeme', desc: '256-bit SSL şifreleme' },
  { icon: '🚚', label: 'Hızlı Teslimat', desc: 'Aynı gün kargo' },
  { icon: '♻️', label: 'Kolay İade', desc: '30 gün iade garantisi' },
]

export default function NewsletterCTA() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Lütfen geçerli bir e-posta adresi girin.')
      return
    }
    setError('')
    setLoading(true)
    // UI-only — gerçek bir backend bağlantısı yok
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  return (
    <section
      className={cn(
        'py-16 lg:py-24',
        isTarim
          ? 'bg-gradient-to-br from-green-700 via-green-600 to-emerald-500'
          : 'bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-600'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ana İçerik: Sol + Sağ */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mb-14">
          {/* Sol: Başlık ve Açıklama */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/20 text-white mb-5">
              Bülten
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              Kampanyalardan Haberdar Olun
            </h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
              {isTarim
                ? 'Gübre, sulama ve tarım teknolojilerindeki özel indirimlerden ve yeni ürünlerden ilk siz haberdar olun.'
                : 'Su arıtma, klima ve ev elektroniğindeki kampanyaları kaçırmayın. Özel abonelik indirimi kazanın.'}
            </p>
            <p className="mt-3 text-white/60 text-sm">
              Spam göndermiyoruz. İstediğiniz zaman abonelikten çıkabilirsiniz.
            </p>
          </div>

          {/* Sağ: Form */}
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            {submitted ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-10 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Teşekkürler!
                </h3>
                <p className="text-white/80">
                  Başarıyla abone oldunuz. Kampanyalar e-posta adresinize iletilecek.
                </p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 sm:px-8 py-8">
                <p className="text-white font-semibold mb-5 text-center">
                  E-posta adresinizi girin, ilk siparişinizde{' '}
                  <span className="text-yellow-300 font-bold">%10 indirim</span> kazanın.
                </p>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError('')
                      }}
                      className={cn(
                        'flex-1 px-4 py-3 rounded-xl text-gray-900 bg-white placeholder-gray-400 text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-white/70',
                        error ? 'ring-2 ring-red-400' : ''
                      )}
                      aria-describedby={error ? 'email-error' : undefined}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        'flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm flex-shrink-0',
                        'bg-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed',
                        isTarim
                          ? 'text-green-700 hover:bg-green-50'
                          : 'text-blue-700 hover:bg-blue-50'
                      )}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>
                          Gönderiliyor...
                        </>
                      ) : (
                        'Abone Ol'
                      )}
                    </button>
                  </div>
                  {error && (
                    <p id="email-error" className="mt-2 text-xs text-red-300">
                      {error}
                    </p>
                  )}
                </form>

                {/* WhatsApp Alternatifi */}
                <div className="mt-5 flex items-center justify-center gap-2 text-white/60 text-sm">
                  <span>Ya da</span>
                  <a
                    href={`https://wa.me/${BRAND.whatsapp.phone}?text=${encodeURIComponent(BRAND.whatsapp.message)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-white/90 hover:text-white underline underline-offset-2 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp&apos;tan yazın
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Güven Rozetleri */}
        <div className="border-t border-white/20 pt-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl">
                  {badge.icon}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{badge.label}</p>
                  <p className="text-white/65 text-xs mt-0.5">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
