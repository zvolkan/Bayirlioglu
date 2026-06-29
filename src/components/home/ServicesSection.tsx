import { BRAND, ACTIVE_BRAND_KEY } from '@/lib/constants'
import { MOCK_SERVICES_TARIM, MOCK_SERVICES_ALBSU } from '@/data/mock'
import type { Service } from '@/lib/types'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const isTarim = ACTIVE_BRAND_KEY === 'alb-tarim'
const services: Service[] = isTarim ? MOCK_SERVICES_TARIM : MOCK_SERVICES_ALBSU

export default function ServicesSection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="text-center mb-14">
          <span
            className={cn(
              'inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4',
              isTarim ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            )}
          >
            {BRAND.name}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Hizmetlerimiz
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {isTarim
              ? 'Çiftçilerimize en iyi tarımsal destek ve danışmanlık hizmetlerini sunuyoruz.'
              : 'Kurulum, periyodik bakım ve 7/24 teknik destek ile her zaman yanınızdayız.'}
          </p>
        </div>

        {/* Kart Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className={cn(
                'group relative flex flex-col bg-white rounded-2xl border p-8 shadow-sm',
                'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                isTarim
                  ? 'border-gray-200 hover:border-green-300 hover:shadow-green-100'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-blue-100'
              )}
            >
              {/* İkon */}
              <div
                className={cn(
                  'flex items-center justify-center w-14 h-14 rounded-xl mb-6 text-3xl',
                  isTarim ? 'bg-green-100' : 'bg-blue-100'
                )}
              >
                <span role="img" aria-label={service.title}>
                  {service.icon}
                </span>
              </div>

              {/* Başlık */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>

              {/* Açıklama */}
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                {service.description}
              </p>

              {/* Özellikler Listesi */}
              {service.features && service.features.length > 0 && (
                <ul className="space-y-2 mb-6 flex-1">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span
                        className={cn(
                          'mt-1.5 flex-shrink-0 w-2 h-2 rounded-full',
                          isTarim ? 'bg-green-500' : 'bg-blue-500'
                        )}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {/* Fiyat Etiketi */}
              {service.price && (
                <div
                  className={cn(
                    'mt-auto mb-4 inline-flex self-start items-center text-xs font-semibold px-3 py-1 rounded-full',
                    isTarim
                      ? 'bg-green-50 text-green-700'
                      : 'bg-blue-50 text-blue-700'
                  )}
                >
                  {service.price}
                </div>
              )}

              {/* Detay Linki */}
              <Link
                href="/hizmetler"
                className={cn(
                  'inline-flex items-center gap-1 text-sm font-semibold mt-auto transition-colors',
                  isTarim
                    ? 'text-green-600 hover:text-green-700'
                    : 'text-blue-600 hover:text-blue-700'
                )}
              >
                Detaylı Bilgi
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Alt CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/hizmetler"
            className={cn(
              'inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200',
              isTarim
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            Tüm Hizmetleri Gör
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
