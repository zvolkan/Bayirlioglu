'use client'
import { useState, useEffect, useRef, Fragment } from 'react'
import { BRAND } from '@/lib/constants'
import Link from 'next/link'

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 150)
    return () => clearTimeout(t)
  }, [])

  const taglineLines = BRAND.tagline.split('\n')

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Arka Plan */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {!videoError && (
          <video ref={videoRef} autoPlay muted loop playsInline
            poster={BRAND.poster}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setVideoError(true)}>
            {/* VIDEO: /public/videos/tarim-hero.mp4 veya su-aritma-hero.mp4 dosyasını ekleyin */}
            <source src={BRAND.video} type="video/mp4" />
          </video>
        )}
        {videoError && (
          // GÖRSEL: BRAND.poster yolunu /public/images/ altına ekleyin
          <div className={`absolute inset-0 ${BRAND.colors.fallbackGradient}`} />
        )}
        <div className={`absolute inset-0 bg-gradient-to-br ${BRAND.colors.gradientOverlay}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </div>

      {/* Hero İçeriği */}
      <div className="relative z-10 flex-1 flex items-center py-20 sm:py-24 lg:py-32 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6 ${BRAND.colors.badgeStyle} transition-all duration-700 ${loaded?'opacity-100 translate-y-0':'opacity-0 translate-y-4'}`}>
              {BRAND.badge}
            </div>
            {/* Alt başlık */}
            <p className={`text-sm sm:text-base font-semibold text-white/60 uppercase tracking-[0.15em] mb-3 transition-all duration-700 delay-100 ${loaded?'opacity-100 translate-y-0':'opacity-0 translate-y-4'}`}>
              {BRAND.subtitle}
            </p>
            {/* Ana Başlık */}
            <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.02] tracking-tight mb-6 transition-all duration-700 delay-150 ${loaded?'opacity-100 translate-y-0':'opacity-0 translate-y-5'}`}>
              {taglineLines.map((line, i) => (
                <Fragment key={i}>{line}{i < taglineLines.length-1 && <br/>}</Fragment>
              ))}
            </h1>
            {/* Açıklama */}
            <p className={`text-base sm:text-lg lg:text-xl text-white/75 leading-relaxed max-w-2xl mb-10 transition-all duration-700 delay-200 ${loaded?'opacity-100 translate-y-0':'opacity-0 translate-y-4'}`}>
              {BRAND.description}
            </p>
            {/* CTA Butonları */}
            <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mb-16 transition-all duration-700 delay-300 ${loaded?'opacity-100 translate-y-0':'opacity-0 translate-y-4'}`}>
              <Link href={BRAND.cta.href} className={`${BRAND.colors.accentPrimary} inline-flex items-center justify-center gap-2 font-bold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200`}>
                {BRAND.cta.label}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
              <Link href={BRAND.ctaSecondary.href} className={`${BRAND.colors.accentSecondary} inline-flex items-center justify-center font-semibold text-base sm:text-lg px-8 py-4 rounded-2xl backdrop-blur-sm hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200`}>
                {BRAND.ctaSecondary.label}
              </Link>
            </div>
            {/* İstatistikler */}
            <div className={`flex flex-wrap items-center gap-x-8 gap-y-4 transition-all duration-700 delay-500 ${loaded?'opacity-100 translate-y-0':'opacity-0 translate-y-4'}`}>
              {BRAND.stats.map((stat, i) => (
                <Fragment key={stat.label}>
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-white leading-none">{stat.value}</div>
                    <div className="text-sm text-white/50 mt-1 font-medium">{stat.label}</div>
                  </div>
                  {i < BRAND.stats.length-1 && <div className={`hidden sm:block w-px h-10 ${BRAND.colors.statDivider}`} aria-hidden="true"/>}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll İndikatörü */}
      <div className={`relative z-10 flex flex-col items-center gap-2 pb-8 transition-all duration-1000 delay-700 ${loaded?'opacity-100':'opacity-0'}`} aria-hidden="true">
        <span className="text-white/40 text-xs tracking-[0.2em] uppercase font-medium">Keşfet</span>
        <div className="w-5 h-8 border border-white/30 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-1.5 bg-white/60 rounded-full animate-bounce"/>
        </div>
      </div>
    </section>
  )
}
