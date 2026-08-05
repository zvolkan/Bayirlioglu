import Link from 'next/link'

const GRUP_LINKS = [
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'Hizmetler', href: '/hizmetler' },
  { label: 'Bayi Başvurusu', href: '/bayi-basvuru' },
  { label: 'İletişim', href: '/iletisim' },
]

const YASAL_LINKS = [
  { label: 'Gizlilik Politikası', href: '/gizlilik' },
  { label: 'Kullanım Koşulları', href: '/kullanim-kosullari' },
  { label: 'İade Politikası', href: '/iade-politikasi' },
  { label: 'KVKK Aydınlatma Metni', href: '/kvkk' },
]

const MARKALAR = [
  {
    key: 'alb-tarim',
    name: 'ALB Tarım',
    desc: 'Gübre, sulama, tarım ilaçları ve ekipman',
    color: 'bg-green-600',
    href: '/alb-tarim',
  },
  {
    key: 'alb-su-aritma',
    name: 'Alb Su Teknolojileri',
    desc: 'Su arıtma, klima ve enerji sistemleri',
    color: 'bg-blue-600',
    href: '/alb-su-aritma',
  },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* ÜST BÖLÜM */}
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* COL 1 — Grup Kimliği + Sosyal Medya */}
            <div className="flex flex-col gap-5">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-700 flex items-center justify-center font-black text-sm text-white flex-shrink-0">
                  BG
                </div>
                <span className="text-white font-bold text-lg leading-tight">
                  Bayırlıoğlu Grup
                </span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                2006 yılından bu yana tarım ve su teknolojileri alanında faaliyet gösteren
                Bayırlıoğlu Grup, ALB Tarım ve Alb Su Teknolojileri markaları altında
                Türkiye genelinde hizmet vermektedir.
              </p>
              <div className="flex items-center gap-3">
                <a href="https://instagram.com/albgrup" target="_blank" rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="https://facebook.com/albgrup" target="_blank" rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="https://youtube.com/@albgrup" target="_blank" rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
                  </svg>
                </a>
                <a href="https://twitter.com/albgrup" target="_blank" rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* COL 2 — Markalarımız */}
            <div>
              <h3 className="text-white font-semibold text-base mb-5">Markalarımız</h3>
              <div className="flex flex-col gap-4">
                {MARKALAR.map((m) => (
                  <Link key={m.key} href={m.href}
                    className="group flex items-start gap-3 hover:opacity-90 transition-opacity">
                    <div className={`${m.color} w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs flex-shrink-0 mt-0.5`}>
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold group-hover:text-gray-200 transition-colors">
                        {m.name}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5 leading-snug">{m.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* COL 3 — Kurumsal + Yasal */}
            <div>
              <h3 className="text-white font-semibold text-base mb-5">Kurumsal</h3>
              <ul className="flex flex-col gap-3 mb-6">
                {GRUP_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <h3 className="text-white font-semibold text-sm mb-3 mt-2">Yasal</h3>
              <ul className="flex flex-col gap-2">
                {YASAL_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}
                      className="text-gray-500 hover:text-gray-300 transition-colors text-xs">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COL 4 — İletişim */}
            <div>
              <h3 className="text-white font-semibold text-base mb-5">İletişim</h3>
              <ul className="flex flex-col gap-4">
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">ALB Tarım</p>
                    <a href="tel:+905071781633" className="text-gray-400 hover:text-white transition-colors text-sm">
                      +90 507 178 16 33
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Alb Su Teknolojileri</p>
                    <a href="tel:+905444142254" className="text-gray-400 hover:text-white transition-colors text-sm">
                      +90 544 414 22 54
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:info@bayirlioglu.com"
                    className="text-gray-400 hover:text-white transition-colors text-sm break-all">
                    info@bayirlioglu.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <a
                    href="https://www.google.com/maps/place//data=!4m2!3m1!1s0x14dc3d918f947551:0x35f4224c2a7044c3?sa=X&ved=1t:8290&ictx=111"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors text-sm leading-relaxed"
                  >
                    Saçkan Kavşağı Doğusu Savcı-Şok Market Yanı,<br />
                    Yeşilyurt, Akdeniz Cd. No:20/22,<br />
                    33640 Anamur / Mersin
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-400 text-sm">Pzt – Cmt: 08:30 – 19:00</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* YASAL KÜNYE — e-ticaret sitelerinde zorunlu */}
      <div className="border-t border-white/10 py-5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-gray-600 text-xs leading-relaxed space-y-1">
            {/* DOLDURULACAK: Ticaret unvanı, MERSİS ve vergi bilgileri resmi
                kayıtlardaki hâliyle yazılmalıdır. */}
            <p>
              <span className="text-gray-500">Ticaret Unvanı:</span> Bayırlıoğlu Grup
              {' · '}
              <span className="text-gray-500">Vergi Dairesi / No:</span> —
              {' · '}
              <span className="text-gray-500">MERSİS No:</span> —
            </p>
            <p>
              <span className="text-gray-500">Adres:</span> Saçkan Kavşağı Doğusu
              Savcı-Şok Market Yanı, Yeşilyurt, Akdeniz Cd. No:20/22, 33640 Anamur / Mersin
            </p>
            <p className="text-gray-600">
              Bu site ETBİS&apos;e kayıtlıdır.
            </p>
          </div>
        </div>
      </div>

      {/* ALT BANT */}
      <div className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Bayırlıoğlu Grup. Tüm hakları saklıdır.
            </p>
            <p className="text-gray-600 text-xs">
              ALB Tarım &amp; Alb Su Teknolojileri
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
