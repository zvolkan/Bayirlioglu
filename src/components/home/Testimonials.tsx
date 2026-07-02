'use client'

import { useState, useEffect } from 'react'
import { BRAND, ACTIVE_BRAND_KEY } from '@/lib/constants'
import { MOCK_TESTIMONIALS } from '@/data/mock'
import { cn } from '@/lib/utils'
import StarRating from '@/components/ui/StarRating'

const isTarim = ACTIVE_BRAND_KEY === 'alb-tarim'
const testimonials = MOCK_TESTIMONIALS.filter((t) => t.brand === ACTIVE_BRAND_KEY)

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (testimonials.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  if (testimonials.length === 0) return null

  return (
    <section
      className={cn(
        'py-16 lg:py-24',
        isTarim ? 'bg-gray-900' : 'bg-blue-950'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="text-center mb-14">
          <span
            className={cn(
              'inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4',
              isTarim ? 'bg-gray-800 text-green-400' : 'bg-blue-900 text-blue-300'
            )}
          >
            Müşteri Yorumları
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Müşterilerimiz Ne Diyor?
          </h2>
          <p className={cn('text-lg max-w-xl mx-auto', isTarim ? 'text-gray-400' : 'text-blue-200')}>
            Binlerce memnun müşterimizden bazı yorumlar.
          </p>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {testimonials.map((testimonial, idx) => (
            <div
              key={testimonial.id}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                'relative rounded-2xl p-8 cursor-pointer transition-all duration-300',
                isTarim
                  ? idx === activeIndex
                    ? 'bg-gray-700 ring-2 ring-green-500 shadow-lg shadow-green-900/20'
                    : 'bg-gray-800 hover:bg-gray-700'
                  : idx === activeIndex
                  ? 'bg-blue-800 ring-2 ring-blue-400 shadow-lg shadow-blue-900/30'
                  : 'bg-blue-900 hover:bg-blue-800'
              )}
            >
              {/* Tırnak İşareti */}
              <div
                className={cn(
                  'text-5xl font-serif leading-none mb-4',
                  isTarim ? 'text-green-500/40' : 'text-blue-400/40'
                )}
              >
                &ldquo;
              </div>

              {/* Yorum Metni */}
              <p className={cn('text-base leading-relaxed mb-6 italic', isTarim ? 'text-gray-200' : 'text-blue-100')}>
                {testimonial.body}
              </p>

              {/* Yıldız Değerlendirmesi */}
              <div className="mb-4">
                <StarRating rating={testimonial.rating} />
              </div>

              {/* Müşteri Bilgisi */}
              <div className="flex items-center gap-4">
                {/* Avatar Placeholder */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold',
                    isTarim
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-500 text-white'
                  )}
                >
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{testimonial.name}</p>
                  <p
                    className={cn(
                      'text-xs',
                      isTarim ? 'text-gray-400' : 'text-blue-300'
                    )}
                  >
                    {testimonial.location}
                    {testimonial.role ? ` · ${testimonial.role}` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nokta İndikatörler */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`${idx + 1}. yoruma git`}
                className={cn(
                  'rounded-full transition-all duration-300',
                  idx === activeIndex
                    ? cn('w-6 h-2', isTarim ? 'bg-green-500' : 'bg-blue-400')
                    : cn(
                        'w-2 h-2',
                        isTarim ? 'bg-gray-600 hover:bg-gray-500' : 'bg-blue-800 hover:bg-blue-700'
                      )
                )}
              />
            ))}
          </div>
        )}

        {/* Alt İstatistik Bant */}
        <div
          className={cn(
            'mt-14 rounded-2xl py-8 px-6',
            isTarim ? 'bg-gray-800' : 'bg-blue-900'
          )}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {BRAND.stats?.map((stat, idx) => (
              <div key={idx}>
                <p
                  className={cn(
                    'text-2xl sm:text-3xl font-bold mb-1',
                    isTarim ? 'text-green-400' : 'text-blue-300'
                  )}
                >
                  {stat.value}
                </p>
                <p className={cn('text-sm', isTarim ? 'text-gray-400' : 'text-blue-300/70')}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
