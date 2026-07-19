'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { BRANDS } from '@/lib/constants'
import type { BrandKey } from '@/lib/types'

const schema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta girin'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin').optional().or(z.literal('')),
  subject: z.string().min(3, 'Konu en az 3 karakter olmalı'),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalı'),
})

type FormData = z.infer<typeof schema>

const CONTACT_TOPICS = [
  'Ürün Bilgisi',
  'Sipariş Takibi',
  'İade & Değişim',
  'Teknik Destek',
  'Bayi Başvurusu',
  'Diğer',
]

export default function IletisimPage() {
  const params = useParams()
  const brandKey = (params.brand as BrandKey) ?? 'alb-tarim'
  const isAlbSu = brandKey === 'alb-su-aritma'
  const cfg = BRANDS[brandKey] ?? BRANDS['alb-tarim']

  const heroBg = isAlbSu ? 'from-blue-900 to-blue-950' : 'from-green-900 to-emerald-950'
  const primaryBtn = isAlbSu ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
  const accentText = isAlbSu ? 'text-blue-600' : 'text-green-600'
  const focusBorder = isAlbSu ? 'focus:border-blue-400 focus:ring-blue-400/20' : 'focus:border-green-400 focus:ring-green-400/20'
  const tagColor = isAlbSu ? 'text-blue-400' : 'text-green-400'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 1200))
    console.log('İletişim formu:', data)
    toast.success('Mesajınız iletildi! En kısa sürede dönüş yapacağız.')
    reset()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className={`bg-gradient-to-br ${heroBg} py-16`}>
        <div className="container-main">
          <nav className="text-sm text-white/50 mb-6">
            <Link href={`/${brandKey}`} className="hover:text-white">{cfg.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">İletişim</span>
          </nav>
          <p className={`font-bold uppercase text-sm tracking-widest mb-3 ${tagColor}`}>İletişim</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">{cfg.name}&apos;e Ulaşın</h1>
          <p className="text-white/60 max-w-xl">Sorularınız, önerileriniz veya hizmet talepleriniz için buradayız.</p>
        </div>
      </section>

      <div className="container-main py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* ── İletişim Bilgileri ── */}
          <div className="lg:col-span-1 space-y-5">
            {[
              {
                icon: '📞',
                title: 'Telefon',
                lines: [isAlbSu ? '+90 544 414 22 54' : '+90 507 178 16 33', 'Hafta içi 08:00–18:00'],
              },
              {
                icon: '📧',
                title: 'E-posta',
                lines: [isAlbSu ? 'info@albtekno.com.tr' : 'info@albtarim.com.tr'],
              },
              {
                icon: '📍',
                title: 'Adres',
                lines: ['Organize Sanayi Bölgesi', 'Konya, Türkiye'],
              },
              {
                icon: '⏰',
                title: 'Çalışma Saatleri',
                lines: ['Pzt–Cuma: 08:00–18:00', 'Cumartesi: 09:00–14:00'],
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
                <div className="text-2xl">{item.icon}</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                  {item.lines.map((line) => (
                    <p key={line} className="text-gray-500 text-sm">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${cfg.whatsapp.phone}?text=${encodeURIComponent(cfg.whatsapp.message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] hover:bg-[#1aad50] text-white rounded-2xl p-5 transition-colors w-full"
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <div>
                <p className="font-bold">WhatsApp ile Yazın</p>
                <p className="text-white/80 text-sm">{cfg.whatsapp.tooltip}</p>
              </div>
            </a>
          </div>

          {/* ── Form ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6">Mesaj Gönderin</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ad Soyad *</label>
                    <input
                      {...register('name')}
                      placeholder="Adınız Soyadınız"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.name ? 'border-red-300 focus:border-red-400' : `border-gray-200 ${focusBorder}`
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-posta *</label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="ornek@email.com"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.email ? 'border-red-300 focus:border-red-400' : `border-gray-200 ${focusBorder}`
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefon</label>
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="0555 000 00 00"
                      className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${focusBorder} transition-colors`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Konu *</label>
                    <select
                      {...register('subject')}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.subject ? 'border-red-300' : `border-gray-200 ${focusBorder}`
                      }`}
                    >
                      <option value="">Konu seçin</option>
                      {CONTACT_TOPICS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mesajınız *</label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    placeholder="Mesajınızı buraya yazın..."
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors resize-none ${
                      errors.message ? 'border-red-300' : `border-gray-200 ${focusBorder}`
                    }`}
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full ${primaryBtn} text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
