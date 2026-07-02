'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BRANDS } from '@/lib/constants'
import { useCart } from '@/hooks/useCart'
import type { BrandKey } from '@/lib/types'
import UserMenuButton from '@/components/layout/UserMenuButton'

// ─── BRAND SWITCHER ───────────────────────────────────────────────────────────

const BRAND_TABS: { key: BrandKey; label: string; icon: string; color: string; activeColor: string }[] = [
  {
    key: 'alb-tarim',
    label: 'ALB Tarım',
    icon: '🌱',
    color: 'text-white/70 hover:text-white hover:bg-white/10',
    activeColor: 'bg-green-600 text-white shadow-green-700/30 shadow-lg',
  },
  {
    key: 'alb-su-aritma',
    label: 'Alb Su Teknolojileri',
    icon: '💧',
    color: 'text-white/70 hover:text-white hover:bg-white/10',
    activeColor: 'bg-blue-600 text-white shadow-blue-700/30 shadow-lg',
  },
]

// ─── HEADER COMPONENT ─────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { getTotalItems } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const cartCount = getTotalItems()

  // Aktif marka belirle
  const activeBrandKey: BrandKey | null =
    pathname.startsWith('/alb-su-aritma') ? 'alb-su-aritma' :
    pathname.startsWith('/alb-tarim') ? 'alb-tarim' : null

  const activeBrand = activeBrandKey ? BRANDS[activeBrandKey] : null

  // Header rengi: aktif markaya göre değişir, yoksa koyu gri
  const headerBg = scrolled
    ? 'bg-gray-900/96 backdrop-blur-md shadow-xl'
    : 'bg-gray-900'

  const accentColor = activeBrandKey === 'alb-su-aritma'
    ? 'bg-blue-600 hover:bg-blue-500'
    : activeBrandKey === 'alb-tarim'
    ? 'bg-green-600 hover:bg-green-500'
    : 'bg-gray-700 hover:bg-gray-600'

  const navHover = activeBrandKey === 'alb-su-aritma'
    ? 'hover:text-blue-400'
    : 'hover:text-green-400'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Marka değiştirildiğinde o markanın ana sayfasına git
  const handleBrandSwitch = (key: BrandKey) => {
    const currentPath = pathname
    // Eğer zaten o markanın sayfasındaysak, pathname'i güncelle
    if (key === 'alb-tarim') {
      if (currentPath.startsWith('/alb-su-aritma')) {
        // /alb-su-aritma/xxx → /alb-tarim/xxx
        router.push(currentPath.replace('/alb-su-aritma', '/alb-tarim'))
      } else {
        router.push('/alb-tarim')
      }
    } else {
      if (currentPath.startsWith('/alb-tarim')) {
        router.push(currentPath.replace('/alb-tarim', '/alb-su-aritma'))
      } else {
        router.push('/alb-su-aritma')
      }
    }
    setMenuOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const base = activeBrandKey ? `/${activeBrandKey}` : '/alb-tarim'
      router.push(`${base}/urunler?arama=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  // Marka nav linkleri — base prefix ekle
  const navPrefix = activeBrandKey ? `/${activeBrandKey}` : ''
  const navItems = activeBrand?.nav.map((item) => ({
    ...item,
    href: navPrefix + item.href,
    children: item.children?.map((c) => ({ ...c, href: navPrefix + c.href })),
  })) ?? []

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${headerBg}`}
      >
        {/* ── ÜSTTE: Bayırlıoğlu logo + Marka seçici + Sağ ikonlar ── */}
        <div className="border-b border-white/10">
          <div className="container-main">
            <div className="flex items-center justify-between h-14 sm:h-16">

              {/* LOGO */}
              <Link href="/" className="flex items-center flex-shrink-0" onClick={() => setMenuOpen(false)}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center font-black text-white text-base">
                  B
                </div>
              </Link>

              {/* MARKA SEÇİCİ — orta */}
              <div className="flex items-center gap-0.5 bg-white/8 rounded-xl p-1">
                {BRAND_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleBrandSwitch(tab.key)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      activeBrandKey === tab.key
                        ? tab.activeColor
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    <span className="hidden xs:inline sm:inline">{
                      tab.key === 'alb-tarim' ? 'ALB Tarım' : 'Alb Su'
                    }</span>
                  </button>
                ))}
              </div>

              {/* SAĞ — Arama, Sepet, Giriş */}
              <div className="flex items-center gap-1">
                {/* Arama */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-white/70 hover:text-white p-2 rounded-lg transition-colors"
                  aria-label="Arama"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Sepet */}
                <Link href="/sepet" className="relative text-white/70 hover:text-white p-2 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* Giriş — desktop */}
                <UserMenuButton accentColor={accentColor} />

                {/* Hamburger — mobile */}
                <button
                  className="md:hidden text-white/70 hover:text-white p-2 rounded-lg transition-colors ml-1"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Menü"
                >
                  <div className="relative w-5 h-5">
                    <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'top-2 rotate-45' : 'top-0.5'}`} />
                    <span className={`absolute block w-5 h-0.5 bg-current top-2 transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
                    <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'top-2 -rotate-45' : 'top-3.5'}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── ALTTA: Aktif markanın nav linkleri (desktop) ── */}
        {activeBrand && (
          <div className="hidden md:block bg-gray-800/60 border-b border-white/5">
            <div className="container-main">
              <nav className="flex items-center gap-0.5 h-10">
                {navItems.map((item) => (
                  <div key={item.label} className="relative group">
                    <Link
                      href={item.href}
                      className={`${navHover} text-white/70 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1`}
                    >
                      {item.label}
                      {item.children && (
                        <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </Link>
                    {item.children && (
                      <div className="absolute top-full left-0 bg-white rounded-xl shadow-xl py-2 min-w-52 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm px-4 py-2 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* ── ARAMA AÇILIR ── */}
        {searchOpen && (
          <div className="absolute top-full inset-x-0 bg-gray-900 border-t border-white/10 p-4 shadow-2xl z-50">
            <form onSubmit={handleSearch} className="container-main">
              <div className="relative max-w-xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeBrand ? `${activeBrand.name} ürünlerinde ara...` : 'Ürün ara...'}
                  className="w-full bg-white/10 text-white placeholder:text-white/40 border border-white/20 rounded-xl px-5 py-3 pr-12 focus:outline-none focus:border-white/40"
                  autoFocus
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </header>

      {/* ── MOBİL MENÜ ── */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-x-0 top-[56px] sm:top-[64px] bg-gray-900 border-t border-white/10 z-40 md:hidden max-h-[80vh] overflow-y-auto">
            {/* Marka seçici - mobile */}
            <div className="p-4 border-b border-white/10">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Marka Seç</p>
              <div className="flex gap-2">
                {BRAND_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { handleBrandSwitch(tab.key); setMenuOpen(false) }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeBrandKey === tab.key ? tab.activeColor : 'bg-white/5 text-white/70'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.key === 'alb-tarim' ? 'ALB Tarım' : 'Alb Su'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nav linkleri */}
            {navItems.length > 0 && (
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      className="block text-white/80 hover:text-white py-3 px-4 rounded-xl hover:bg-white/10 font-medium transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ml-4 space-y-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block text-white/50 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 text-sm transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            )}

            <div className="p-4 border-t border-white/10">
              <Link
                href="/giris"
                className={`block text-center text-sm px-4 py-3 rounded-xl font-semibold text-white transition-colors ${accentColor}`}
                onClick={() => setMenuOpen(false)}
              >
                Giriş Yap
              </Link>
              <Link
                href="/sepet"
                className="mt-2 flex items-center justify-center gap-2 text-white/70 py-2 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                🛒 Sepetim {cartCount > 0 && `(${cartCount})`}
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
