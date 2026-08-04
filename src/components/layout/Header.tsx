'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { BRANDS } from '@/lib/constants'
import { useCart } from '@/hooks/useCart'
import { useCartStore } from '@/store/cartStore'
import type { BrandKey } from '@/lib/types'
import UserMenuButton from '@/components/layout/UserMenuButton'
import MobileUserSection from '@/components/layout/MobileUserSection'

// ─── BRAND SWITCHER ───────────────────────────────────────────────────────────

const BRAND_TABS: { key: BrandKey; label: string; icon: string; activeColor: string }[] = [
  {
    key: 'alb-tarim',
    label: 'ALB Tarım',
    icon: '🌱',
    activeColor: 'bg-green-600 text-white shadow-green-700/30 shadow-lg',
  },
  {
    key: 'alb-su-aritma',
    label: 'Alb Su Teknolojileri',
    icon: '💧',
    activeColor: 'bg-blue-600 text-white shadow-blue-700/30 shadow-lg',
  },
]

// ─── HEADER COMPONENT ─────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { getTotalItems } = useCart()
  // Sepet localStorage'dan okunmadan rozet basılmaz — sunucu 0, istemci N
  // render edip hydration uyumsuzluğu üretiyordu.
  const cartHydrated = useCartStore((s) => s.hasHydrated)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // JS-tabanlı dropdown: CSS group-hover yerine timer kullanıyoruz
  // → mouse'u nav item'dan dropdown'a geçerken dropdown kapanmıyor
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cartCount = cartHydrated ? getTotalItems() : 0

  // Aktif marka belirle
  const activeBrandKey: BrandKey | null =
    pathname.startsWith('/alb-su-aritma') ? 'alb-su-aritma' :
    pathname.startsWith('/alb-tarim') ? 'alb-tarim' : null

  const activeBrand = activeBrandKey ? BRANDS[activeBrandKey] : null

  // Hero sayfasında mı? → marka ana sayfası
  const isHeroPage = !!activeBrandKey && (
    pathname === `/${activeBrandKey}` || pathname === `/${activeBrandKey}/`
  )

  // Header arka planı
  const headerBg =
    isHeroPage && !scrolled
      ? 'bg-transparent'
      : scrolled
      ? 'bg-gray-900/95 backdrop-blur-xl shadow-2xl shadow-black/20'
      : 'bg-gray-900'

  const accentColor = activeBrandKey === 'alb-su-aritma'
    ? 'bg-blue-600 hover:bg-blue-500'
    : activeBrandKey === 'alb-tarim'
    ? 'bg-green-600 hover:bg-green-500'
    : 'bg-gray-700 hover:bg-gray-600'

  const navHover = activeBrandKey === 'alb-su-aritma' ? 'hover:text-blue-300' : 'hover:text-green-300'
  const dropdownAccent = activeBrandKey === 'alb-su-aritma' ? 'bg-blue-500' : 'bg-green-500'
  const dropdownDot    = activeBrandKey === 'alb-su-aritma' ? 'bg-blue-400/60' : 'bg-green-400/60'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Dropdown aç/kapat — timer sayesinde gap'te bile kapanmaz
  const openDropdown = (label: string) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current)
    setActiveDropdown(label)
  }
  const scheduleClose = () => {
    dropdownTimerRef.current = setTimeout(() => setActiveDropdown(null), 120)
  }
  const cancelClose = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current)
  }

  useEffect(() => () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current)
  }, [])

  // Marka değiştirildiğinde o markanın sayfasına git
  const handleBrandSwitch = (key: BrandKey) => {
    const currentPath = pathname
    if (key === 'alb-tarim') {
      router.push(
        currentPath.startsWith('/alb-su-aritma')
          ? currentPath.replace('/alb-su-aritma', '/alb-tarim')
          : '/alb-tarim'
      )
    } else {
      router.push(
        currentPath.startsWith('/alb-tarim')
          ? currentPath.replace('/alb-tarim', '/alb-su-aritma')
          : '/alb-su-aritma'
      )
    }
    setMenuOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const term = searchQuery.trim()
    if (term.length < 2) return

    // Arama sunucuda yapılır; sonuç sayfası filtreleri sıfırdan kurar
    const base = activeBrandKey ? `/${activeBrandKey}` : '/alb-tarim'
    router.push(`${base}/urunler?arama=${encodeURIComponent(term)}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  const navPrefix = activeBrandKey ? `/${activeBrandKey}` : ''
  const navItems = activeBrand?.nav.map((item) => ({
    ...item,
    href: navPrefix + item.href,
    children: item.children?.map((c) => ({ ...c, href: navPrefix + c.href })),
  })) ?? []

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-500 ${headerBg}`}>

        {/* ── ÜSTTE: Logo + Marka seçici + Sağ ikonlar ── */}
        <div className={`border-b transition-all duration-500 ${
          isHeroPage && !scrolled ? 'border-white/15' : 'border-white/10'
        }`}>
          <div className="container-main">
            <div
              className={`flex items-center justify-between transition-[height] duration-500 ease-out ${
                scrolled ? 'h-12 sm:h-14' : 'h-14 sm:h-16'
              }`}
            >

              {/* LOGO */}
              <Link
                href="/"
                className="flex items-center flex-shrink-0 transition-transform duration-300 hover:scale-105 active:scale-95"
                onClick={() => setMenuOpen(false)}
              >
                <Image
                  src="/images/logo-mark-white.svg"
                  alt="Bayırlıoğlu"
                  width={44}
                  height={44}
                  className={`object-contain transition-all duration-500 ease-out ${
                    scrolled ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-9 h-9 sm:w-10 sm:h-10'
                  }`}
                  priority
                />
              </Link>

              {/* MARKA SEÇİCİ */}
              <div className={`flex items-center gap-0.5 rounded-xl p-1 transition-all duration-500 ${
                isHeroPage && !scrolled ? 'bg-white/10 backdrop-blur-sm' : 'bg-white/8'
              }`}>
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
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* SAĞ — Arama, Sepet, Giriş, Hamburger */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
                  aria-label="Arama"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                <Link href="/sepet" className="relative text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>

                <UserMenuButton accentColor={accentColor} />

                <button
                  className="md:hidden text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200 ml-1"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Menü"
                >
                  <div className="relative w-5 h-5">
                    <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'top-2 rotate-45' : 'top-0.5'}`} />
                    <span className={`absolute block w-5 h-0.5 bg-current top-2 transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`} />
                    <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'top-2 -rotate-45' : 'top-3.5'}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── ALTTA: Aktif markanın nav linkleri (desktop) ── */}
        {activeBrand && (
          <div className={`hidden md:block border-b transition-all duration-500 ${
            isHeroPage && !scrolled
              ? 'bg-transparent border-white/10'
              : 'bg-gray-800/60 border-white/5'
          }`}>
            <div className="container-main">
              <nav className="flex items-center gap-0.5 h-10">
                {navItems.map((item) => (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => openDropdown(item.label)}
                    onMouseLeave={scheduleClose}
                  >
                    <Link
                      href={item.href}
                      data-active={pathname === item.href}
                      className={`link-underline text-white/70 ${navHover} text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:bg-white/8 whitespace-nowrap`}
                    >
                      {item.label}
                      {item.children && (
                        <svg
                          className={`w-3 h-3 opacity-50 transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </Link>

                    {/* Dropdown paneli — JS kontrollü, gap sorunu yok */}
                    {item.children && (
                      <div
                        className={`absolute top-full left-0 z-50 pt-2 min-w-[13rem] transition-all duration-300 ${
                          activeDropdown === item.label
                            ? 'opacity-100 pointer-events-auto'
                            : 'opacity-0 pointer-events-none'
                        }`}
                        onMouseEnter={cancelClose}
                        onMouseLeave={scheduleClose}
                      >
                        {/* pt-2 → görünmez köprü: mouse gap'ten geçerken dropdown açık kalır */}
                        <div
                          className={`bg-gray-900 border border-white/12 rounded-2xl shadow-2xl shadow-black/50 py-2 origin-top transition-all duration-300 ease-out ${
                            activeDropdown === item.label
                              ? 'translate-y-0 scale-100'
                              : '-translate-y-2 scale-[0.97]'
                          }`}
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              onClick={() => setActiveDropdown(null)}
                              className={`group/item flex items-center gap-2.5 text-white/75 ${navHover} text-sm px-4 py-2.5 transition-all duration-200 hover:bg-white/8 hover:pl-5`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-transform duration-200 group-hover/item:scale-150 ${dropdownDot}`} />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* ── ARAMA ── */}
        {searchOpen && (
          <div className="absolute top-full inset-x-0 bg-gray-900/97 backdrop-blur-xl border-t border-white/10 p-4 shadow-2xl z-50">
            <form onSubmit={handleSearch} className="container-main">
              <div className="relative max-w-xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeBrand ? `${activeBrand.name} ürünlerinde ara...` : 'Ürün ara...'}
                  className="w-full bg-white/10 text-white placeholder:text-white/40 border border-white/20 rounded-xl px-5 py-3 pr-12 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-200"
                  autoFocus
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-x-0 top-[56px] sm:top-[64px] bg-gray-900/97 backdrop-blur-xl border-t border-white/10 z-40 md:hidden max-h-[80vh] overflow-y-auto">

            <div className="p-4 border-b border-white/10">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Marka Seç</p>
              <div className="flex gap-2">
                {BRAND_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { handleBrandSwitch(tab.key); setMenuOpen(false) }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeBrandKey === tab.key
                        ? tab.activeColor
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {navItems.length > 0 && (
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      className="block text-white/80 hover:text-white py-3 px-4 rounded-xl hover:bg-white/10 font-medium transition-all duration-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ml-4 mt-0.5 space-y-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex items-center gap-2 text-white/55 hover:text-white py-2 px-4 rounded-lg hover:bg-white/8 text-sm transition-all duration-200"
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

            <MobileUserSection
              accentColor={accentColor}
              cartCount={cartCount}
              onClose={() => setMenuOpen(false)}
            />
          </div>
        </>
      )}
    </>
  )
}
