'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import Link from 'next/link'
import { BRANDS } from '@/lib/constants'
import type { BrandKey } from '@/lib/types'

interface Props {
  brandKey: BrandKey
}

export default function BrandHeroSection({ brandKey }: Props) {
  const cfg = BRANDS[brandKey]
  const isAlbSu = brandKey === 'alb-su-aritma'

  const [loaded, setLoaded]       = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Giriş animasyonunu tetikle
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Video yüklendi → fade in
  const handleVideoCanPlay = () => setVideoReady(true)

  const taglineLines = cfg.tagline.split('\n')

  // Renk şeması
  const heroBg       = isAlbSu ? 'from-blue-950 via-blue-900 to-cyan-950'       : 'from-green-950 via-green-900 to-emerald-950'
  const overlayColor = isAlbSu ? 'from-blue-950/85 via-blue-900/60 to-cyan-950/80' : 'from-green-950/85 via-green-900/60 to-emerald-950/80'
  const tagText      = isAlbSu ? 'text-blue-400'   : 'text-green-400'
  const primaryBtn   = isAlbSu ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/40' : 'bg-green-600 hover:bg-green-500 shadow-green-600/40'
  const outlineBtn   = isAlbSu ? 'border-blue-400/60 hover:bg-blue-400/10 focus:ring-blue-400' : 'border-green-400/60 hover:bg-green-400/10 focus:ring-green-400'
  const badgeBg      = isAlbSu ? 'bg-blue-500/15 border-blue-400/30 text-blue-300' : 'bg-green-500/15 border-green-400/30 text-green-300'
  const dividerColor = isAlbSu ? 'bg-blue-500/40' : 'bg-green-500/40'

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden -mt-14 sm:-mt-16 md:-mt-[6.5rem]">

      {/* ── Arka Plan Katmanı ── */}
      <div className="absolute inset-0 z-0" aria-hidden="true">

        {/* Fallback gradient (video yokken veya hata varsa görünür) */}
        <div className={`absolute inset-0 bg-gradient-to-br ${heroBg}`} />

        {/* Video */}
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={cfg.poster}
            onCanPlay={handleVideoCanPlay}
            onError={() => setVideoError(true)}
            className={[
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000',
              videoReady ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          >
            <source src={cfg.video} type="video/mp4" />
          </video>
        )}

        {/* Koyu renk gradient overlay — videoyu okunabilir kılar */}
        <div className={`absolute inset-0 bg-gradient-to-br ${overlayColor}`} />

        {/* Üstten alta siyah fade — içerik bölümünü vurgular */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />

        {/* Dekoratif ışık efekti */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full bg-white/3 blur-3xl pointer-events-none" />
      </div>

      {/* ── Hero İçeriği ── */}
      <div className="relative z-10 flex-1 flex items-center py-24 sm:py-28 lg:py-36 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-3xl">

            {/* Badge */}
            <div
              className={[
                'inline-flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-medium mb-6',
                badgeBg,
                'transition-all duration-700',
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
              ].join(' ')}
            >
              <span className="w-2 h-2 rounded-full bg-current opacity-80 animate-pulse" />
              {cfg.badge}
            </div>

            {/* Alt başlık */}
            <p
              className={[
                'text-sm sm:text-base font-semibold text-white/55 uppercase tracking-[0.18em] mb-4',
                'transition-all duration-700 delay-100',
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
              ].join(' ')}
            >
              {cfg.subtitle}
            </p>

            {/* Ana başlık */}
            <h1
              className={[
                'text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.02] tracking-tight mb-6',
                'transition-all duration-700 delay-150',
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
              ].join(' ')}
            >
              {taglineLines.map((line, i) => (
                <Fragment key={i}>
                  <span className={i === 1 ? `${tagText}` : 'text-white'}>
                    {line}
                  </span>
                  {i < taglineLines.length - 1 && <br />}
                </Fragment>
              ))}
            </h1>

            {/* Açıklama */}
            <p
              className={[
                'text-base sm:text-lg lg:text-xl text-white/70 leading-relaxed max-w-2xl mb-10',
                'transition-all duration-700 delay-200',
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
              ].join(' ')}
            >
              {cfg.description}
            </p>

            {/* CTA Butonları */}
            <div
              className={[
                'flex flex-col sm:flex-row gap-3 sm:gap-4 mb-16',
                'transition-all duration-700 delay-300',
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
              ].join(' ')}
            >
              {isAlbSu ? (
                <>
                  <Link
                    href={`/${brandKey}/urunler?kullanim=ev`}
                    className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 font-bold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
                  >
                    🏠 Eviniz İçin
                  </Link>
                  <Link
                    href={`/${brandKey}/urunler?kullanim=is-yeri`}
                    className={`inline-flex items-center justify-center border-2 ${outlineBtn} text-white font-semibold text-base sm:text-lg px-8 py-4 rounded-2xl backdrop-blur-sm hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200`}
                  >
                    🏢 İş Yeriniz İçin
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={`/${brandKey}${cfg.cta.href}`}
                    className={`inline-flex items-center justify-center gap-2 ${primaryBtn} text-white font-bold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200`}
                  >
                    {cfg.cta.label}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href={`/${brandKey}${cfg.ctaSecondary.href}`}
                    className={`inline-flex items-center justify-center border-2 ${outlineBtn} text-white font-semibold text-base sm:text-lg px-8 py-4 rounded-2xl backdrop-blur-sm hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200`}
                  >
                    {cfg.ctaSecondary.label}
                  </Link>
                </>
              )}
            </div>

            {/* İstatistikler */}
            <div
              className={[
                'flex flex-wrap items-center gap-x-8 gap-y-4',
                'transition-all duration-700 delay-500',
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
              ].join(' ')}
            >
              {cfg.stats.map((stat, i) => (
                <Fragment key={stat.label}>
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-white leading-none">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/50 mt-1 font-medium">{stat.label}</div>
                  </div>
                  {i < cfg.stats.length - 1 && (
                    <div className={`hidden sm:block w-px h-10 ${dividerColor}`} aria-hidden="true" />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll İndikatörü ── */}
      <div
        className={[
          'relative z-10 flex flex-col items-center gap-2 pb-10',
          'transition-all duration-1000 delay-700',
          loaded ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        aria-hidden="true"
      >
        <span className="text-white/35 text-[10px] tracking-[0.25em] uppercase font-medium">
          Keşfet
        </span>
        <div className="w-5 h-8 border border-white/25 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-1.5 bg-white/55 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
