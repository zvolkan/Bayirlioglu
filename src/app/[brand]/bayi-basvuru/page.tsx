'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { BRANDS } from '@/lib/constants'
import { submitDealerApplication } from '@/app/actions/forms'
import type { BrandKey } from '@/lib/types'

const schema = z.object({
  companyName: z.string().min(2, 'Şirket adı gerekli'),
  contactName: z.string().min(2, 'Yetkili adı gerekli'),
  email: z.string().email('Geçerli e-posta girin'),
  phone: z.string().min(10, 'Geçerli telefon girin'),
  city: z.string().min(2, 'Şehir gerekli'),
  district: z.string().min(2, 'İlçe gerekli'),
  existingBusiness: z.enum(['evet', 'hayir']),
  experience: z.string().min(1, 'Deneyim seçin'),
  message: z.string().optional(),
  terms: z.boolean().refine((v) => v, 'Koşulları kabul etmeniz gerekiyor'),
})

type FormData = z.infer<typeof schema>

const BENEFITS_TARIM = [
  { icon: '💰', title: 'Rekabetçi Fiyatlar', desc: 'Toplu alım avantajlarıyla yüksek kâr marjı' },
  { icon: '📦', title: 'Stok Desteği', desc: 'Sezon başı stok finansmanı imkânı' },
  { icon: '🚚', title: 'Hızlı Teslimat', desc: '24 saatte depo teslimi' },
  { icon: '📚', title: 'Eğitim & Destek', desc: 'Ürün eğitimleri ve satış desteği' },
  { icon: '📣', title: 'Pazarlama Desteği', desc: 'Reklam materyalleri ve dijital destek' },
  { icon: '🔧', title: 'Teknik Destek', desc: 'Satış sonrası teknik ekip desteği' },
]

const BENEFITS_ALBSU = [
  { icon: '💰', title: 'Yüksek Kâr Marjı', desc: 'Sektörün en iyi bayi fiyatları' },
  { icon: '🛠️', title: 'Montaj Eğitimi', desc: 'Sertifikalı montaj teknisyeni olma fırsatı' },
  { icon: '🔧', title: 'Teknik Destek', desc: '7/24 arka ofis teknik desteği' },
  { icon: '📦', title: 'Demo Ürün', desc: 'Showroom için demo cihaz desteği' },
  { icon: '📣', title: 'Bölge Koruma', desc: 'Belirlenen bölgede tek bayi hakkı' },
  { icon: '📚', title: 'Ürün Eğitimi', desc: 'Online ve saha ürün eğitimleri' },
]

export default function BayiBasvuruPage() {
  const params = useParams()
  const brandKey = (params.brand as BrandKey) ?? 'alb-tarim'
  const isAlbSu = brandKey === 'alb-su-aritma'
  const cfg = BRANDS[brandKey] ?? BRANDS['alb-tarim']
  const benefits = isAlbSu ? BENEFITS_ALBSU : BENEFITS_TARIM

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
    const parts = data.contactName.trim().split(/\s+/)

    const result = await submitDealerApplication({
      companyName: data.companyName,
      firstName: parts[0] ?? data.contactName,
      lastName: parts.slice(1).join(' ') || '-',
      email: data.email,
      phone: data.phone,
      city: data.city,
      district: data.district,
      brandInterest: brandKey,
      businessType: data.existingBusiness === 'evet' ? 'Mevcut işletme var' : 'Yeni girişim',
      annualRevenue: data.experience,
      message: data.message,
    })

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success('Başvurunuz alındı! Satış ekibimiz 1-2 iş günü içinde sizinle iletişime geçecek.')
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
            <span className="text-white/80">Bayi Başvurusu</span>
          </nav>
          <p className={`font-bold uppercase text-sm tracking-widest mb-3 ${tagColor}`}>Bayilik</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {cfg.name} Bayisi Olun
          </h1>
          <p className="text-white/60 max-w-xl">
            {isAlbSu
              ? 'Su teknolojileri alanında büyüyen pazarın bir parçası olun, karlı bir iş kurun.'
              : 'Türkiye\'nin güvenilir tarım markasının gücünden yararlanın, bölgenizde büyüyün.'}
          </p>
        </div>
      </section>

      {/* Avantajlar */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="container-main">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900">Bayi Avantajları</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4 p-5 bg-gray-50 rounded-2xl">
                <div className="text-2xl">{b.icon}</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{b.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Başvuru Formu */}
      <section className="py-14 container-main">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-8">
            <h2 className="text-xl font-black text-gray-900 mb-6">Başvuru Formu</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="bayi-companyName" className="block text-sm font-semibold text-gray-700 mb-1.5">Şirket Adı *</label>
                  <input
                    {...register('companyName')}
                    id="bayi-companyName"
                    placeholder="Şirketinizin adı"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.companyName ? 'border-red-300' : `border-gray-200 ${focusBorder}`}`}
                  />
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                </div>
                <div>
                  <label htmlFor="bayi-contactName" className="block text-sm font-semibold text-gray-700 mb-1.5">Yetkili Adı *</label>
                  <input
                    {...register('contactName')}
                    id="bayi-contactName"
                    placeholder="Ad Soyad"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.contactName ? 'border-red-300' : `border-gray-200 ${focusBorder}`}`}
                  />
                  {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName.message}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="bayi-email" className="block text-sm font-semibold text-gray-700 mb-1.5">E-posta *</label>
                  <input
                    {...register('email')}
                    id="bayi-email"
                    type="email"
                    placeholder="ornek@sirket.com"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.email ? 'border-red-300' : `border-gray-200 ${focusBorder}`}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="bayi-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">Telefon *</label>
                  <input
                    {...register('phone')}
                    id="bayi-phone"
                    type="tel"
                    placeholder="0555 000 00 00"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-300' : `border-gray-200 ${focusBorder}`}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="bayi-city" className="block text-sm font-semibold text-gray-700 mb-1.5">Şehir *</label>
                  <input
                    {...register('city')}
                    id="bayi-city"
                    placeholder="İstanbul"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.city ? 'border-red-300' : `border-gray-200 ${focusBorder}`}`}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label htmlFor="bayi-district" className="block text-sm font-semibold text-gray-700 mb-1.5">İlçe *</label>
                  <input
                    {...register('district')}
                    id="bayi-district"
                    placeholder="Kadıköy"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.district ? 'border-red-300' : `border-gray-200 ${focusBorder}`}`}
                  />
                  {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="bayi-existingBusiness" className="block text-sm font-semibold text-gray-700 mb-1.5">Mevcut İşletme *</label>
                  <select
                    {...register('existingBusiness')}
                    id="bayi-existingBusiness"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.existingBusiness ? 'border-red-300' : `border-gray-200 ${focusBorder}`}`}
                  >
                    <option value="">Seçin</option>
                    <option value="evet">Evet, mevcut işletmem var</option>
                    <option value="hayir">Hayır, yeni kuracağım</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bayi-experience" className="block text-sm font-semibold text-gray-700 mb-1.5">Sektör Deneyimi *</label>
                  <select
                    {...register('experience')}
                    id="bayi-experience"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.experience ? 'border-red-300' : `border-gray-200 ${focusBorder}`}`}
                  >
                    <option value="">Seçin</option>
                    <option value="0">Deneyimim yok</option>
                    <option value="1-3">1–3 yıl</option>
                    <option value="3-5">3–5 yıl</option>
                    <option value="5+">5 yıl üzeri</option>
                  </select>
                  {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="bayi-message" className="block text-sm font-semibold text-gray-700 mb-1.5">Ek Bilgi</label>
                <textarea
                  {...register('message')}
                    id="bayi-message"
                  rows={3}
                  placeholder="Kendiniz veya işletmeniz hakkında eklemek istediğiniz bilgiler..."
                  className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${focusBorder} resize-none`}
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  {...register('terms')}
                  type="checkbox"
                  id="terms"
                  className="mt-1 rounded"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  <Link href="/kullanim-kosullari" className={`${accentText} underline`}>Kullanım koşullarını</Link>{' '}
                  ve{' '}
                  <Link href="/gizlilik" className={`${accentText} underline`}>gizlilik politikasını</Link>{' '}
                  okudum, kabul ediyorum.
                </label>
              </div>
              {errors.terms && <p className="text-red-500 text-xs">{errors.terms.message}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${primaryBtn} text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-60`}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Başvuru Gönder'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
