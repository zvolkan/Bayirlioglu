'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BRAND } from '@/lib/constants'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const count = Array.isArray(cart)
        ? cart.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 1), 0)
        : 0
      setCartCount(count)
    } catch {
      setCartCount(0)
    }
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-gray-900'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div
              className={`${BRAND.colors.logoBg} w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm`}
            >
              {BRAND.name.charAt(0)}
            </div>
            <span className="text-white font-bold text-lg">{BRAND.name}</span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1">
            {BRAND.nav.map((item) => (
              <div key={item.label} className="relative group">
                <a
                  href={item.href}
                  className={`${BRAND.colors.navHover} text-white/75 text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-1`}
                >
                  {item.label}
                  {item.children && item.children.length > 0 && (
                    <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </a>
                {item.children && item.children.length > 0 && (
                  <div className="absolute top-full left-0 bg-white rounded-xl shadow-xl py-2 min-w-48 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                    {item.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="block text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm px-4 py-2 transition-colors"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* ACTION ICONS */}
          <div className="hidden md:flex items-center gap-2">
            {/* Arama */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-white/75 hover:text-white p-2 rounded-lg transition-colors"
              aria-label="Arama"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Sepet */}
            <Link href="/sepet" className="relative text-white/75 hover:text-white p-2 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Giris */}
            <Link
              href="/giris"
              className={`${BRAND.colors.accentPrimary} text-sm px-4 py-2 rounded-xl font-semibold transition-all duration-200`}
            >
              Giris Yap
            </Link>
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            className="md:hidden text-white/75 hover:text-white p-2 rounded-lg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Menuyu Kapat' : 'Menuyu Ac'}
          >
            <div className="relative w-5 h-5">
              <span
                className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 ${
                  menuOpen ? 'top-2 rotate-45' : 'top-0.5'
                }`}
              />
              <span
                className={`absolute block w-5 h-0.5 bg-current top-2 transition-all duration-300 ${
                  menuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 ${
                  menuOpen ? 'top-2 -rotate-45' : 'top-3.5'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-16 bg-gray-900 border-t border-white/10 p-4 z-30 md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex flex-col gap-1">
            {BRAND.nav.map((item) => (
              <div key={item.label}>
                <a
                  href={item.href}
                  className="block text-white/80 hover:text-white py-3 px-4 rounded-xl hover:bg-white/10 border-b border-white/5 transition-colors font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
                {item.children && item.children.length > 0 && (
                  <div className="mt-1">
                    {item.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="block text-white/60 hover:text-white py-2 pl-8 pr-4 rounded-xl hover:bg-white/10 transition-colors text-sm"
                        onClick={() => setMenuOpen(false)}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-white/10">
            <Link
              href="/giris"
              className={`${BRAND.colors.accentPrimary} block text-center text-sm px-4 py-3 rounded-xl font-semibold transition-all duration-200`}
              onClick={() => setMenuOpen(false)}
            >
              Giris Yap
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
