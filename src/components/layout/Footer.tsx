import Link from 'next/link'
import { BRAND, SITE_CONFIG, ACTIVE_BRAND_KEY } from '@/lib/constants'
import { MOCK_CATEGORIES_TARIM, MOCK_CATEGORIES_ALBSU } from '@/data/mock'
import type { Category } from '@/lib/types'

export default function Footer() {
  const categories: Category[] =
    ACTIVE_BRAND_KEY === 'alb-tarim' ? MOCK_CATEGORIES_TARIM : MOCK_CATEGORIES_ALBSU

  return (
    <footer className="bg-gray-900 text-white">
      {/* UST BOLUM */}
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* COL 1: Logo + Aciklama + Sosyal Medya */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div
                  className={`${BRAND.colors.logoBg} w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0`}
                >
                  {BRAND.name.charAt(0)}
                </div>
                <span className="text-white font-bold text-lg">{BRAND.name}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {BRAND.description || `${BRAND.name} resmi web sitesi. Kaliteli urunler ve guvenilir hizmet.`}
              </p>
              {/* Sosyal Medya */}
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a
                  href="#"
                  aria-label="Instagram"
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                {/* Facebook */}
                <a
                  href="#"
                  aria-label="Facebook"
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="#"
                  aria-label="YouTube"
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
                  </svg>
                </a>
                {/* Twitter / X */}
                <a
                  href="#"
                  aria-label="Twitter"
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* COL 2: Hizli Linkler */}
            <div>
              <h3 className="text-white font-semibold text-base mb-5">Hizli Linkler</h3>
              <ul className="flex flex-col gap-3">
                {BRAND.nav.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* COL 3: Kategoriler */}
            <div>
              <h3 className="text-white font-semibold text-base mb-5">Kategoriler</h3>
              <ul className="flex flex-col gap-3">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/kategori/${category.slug}`}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COL 4: Iletisim */}
            <div>
              <h3 className="text-white font-semibold text-base mb-5">Iletisim</h3>
              <ul className="flex flex-col gap-4">
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${SITE_CONFIG.phone}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {SITE_CONFIG.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${SITE_CONFIG.email}`} className="text-gray-400 hover:text-white transition-colors text-sm break-all">
                    {SITE_CONFIG.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-400 text-sm leading-relaxed">{SITE_CONFIG.address}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-400 text-sm">{SITE_CONFIG.workingHours}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ALT BANT */}
      <div className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; 2026 {BRAND.name} Tum haklari saklidir.
            </p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Link href="/gizlilik-politikasi" className="text-gray-400 hover:text-white transition-colors text-sm">
                Gizlilik Politikasi
              </Link>
              <span className="text-gray-600 text-sm">|</span>
              <Link href="/kullanim-kosullari" className="text-gray-400 hover:text-white transition-colors text-sm">
                Kullanim Kosullari
              </Link>
              <span className="text-gray-600 text-sm">|</span>
              <Link href="/iade-politikasi" className="text-gray-400 hover:text-white transition-colors text-sm">
                Iade Politikasi
              </Link>
              <span className="text-gray-600 text-sm">|</span>
              <Link href="/kvkk" className="text-gray-400 hover:text-white transition-colors text-sm">
                KVKK
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
