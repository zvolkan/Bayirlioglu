'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { BRAND, TURKISH_CITIES } from '@/lib/constants'

const schema = z
  .object({
    firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
    lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, 'Geçerli bir telefon numarası girin'),
    city: z.string().min(1, 'Şehir seçin'),
    district: z.string().min(2, 'İlçe girin'),
    address: z.string().min(10, 'Adres en az 10 karakter olmalı'),
    paymentMethod: z.enum(['kredi', 'havale', 'kapida']),
    cardNumber: z.string().optional(),
    cardName: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'kredi') {
      if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ''))) {
        ctx.addIssue({ code: 'custom', path: ['cardNumber'], message: '16 haneli kart numarası girin' })
      }
      if (!data.cardName || data.cardName.trim().length < 3) {
        ctx.addIssue({ code: 'custom', path: ['cardName'], message: 'Kart üzerindeki ismi girin' })
      }
      if (!data.cardExpiry || !/^\d{2}\/\d{2}$/.test(data.cardExpiry)) {
        ctx.addIssue({ code: 'custom', path: ['cardExpiry'], message: 'MM/YY formatında girin' })
      }
      if (!data.cardCvv || !/^\d{3,4}$/.test(data.cardCvv)) {
        ctx.addIssue({ code: 'custom', path: ['cardCvv'], message: 'Geçerli CVV girin' })
      }
    }
  })

type FormValues = z.infer<typeof schema>

const KARGO_LIMIT = 500
const KARGO_UCRETI = 29.9
const KDV_ORANI = 0.18

export default function OdemePage() {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)

  const araToplam = items.reduce(
    (sum, item) =>
      sum + (item.product.salePrice ?? item.product.price) * item.quantity,
    0
  )
  const kargoUcreti = araToplam >= KARGO_LIMIT ? 0 : KARGO_UCRETI
  const kdv = araToplam * KDV_ORANI
  const toplam = araToplam + kargoUcreti + kdv

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'kredi' },
  })

  const selectedPayment = watch('paymentMethod')

  const onSubmit = async (_data: FormValues) => {
    setLoading(true)
    await new Promise((res) => setTimeout(res, 1200))
    clearCart()
    toast.success('Siparişiniz başarıyla alındı!')
    router.push('/tesekkurler')
  }

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition'
  const errorClass = 'text-xs text-red-500 mt-1'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Adım Göstergesi */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[
            { no: 1, label: 'Sepet', done: true },
            { no: 2, label: 'Ödeme', done: false, active: true },
            { no: 3, label: 'Onay', done: false },
          ].map((step, i) => (
            <div key={step.no} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${step.done ? `${BRAND.colors.primary} text-white` : step.active ? `${BRAND.colors.primary} text-white` : 'bg-gray-200 text-gray-400'}`}
                >
                  {step.done && !step.active ? '✓' : step.no}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${step.active ? 'text-gray-900' : step.done ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  {step.label}
                </span>
              </div>
              {i < 2 && (
                <div className="w-12 sm:w-20 h-px bg-gray-200 mx-1" />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol: Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Adres Formu */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  Teslimat Adresi
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Ad</label>
                    <input {...register('firstName')} className={inputClass} placeholder="Adınız" />
                    {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Soyad</label>
                    <input {...register('lastName')} className={inputClass} placeholder="Soyadınız" />
                    {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Telefon</label>
                    <input {...register('phone')} className={inputClass} placeholder="05xx xxx xx xx" />
                    {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Şehir</label>
                    <select {...register('city')} className={inputClass}>
                      <option value="">Şehir seçin</option>
                      {TURKISH_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {errors.city && <p className={errorClass}>{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>İlçe</label>
                    <input {...register('district')} className={inputClass} placeholder="İlçe" />
                    {errors.district && <p className={errorClass}>{errors.district.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Açık Adres</label>
                    <textarea
                      {...register('address')}
                      rows={3}
                      className={inputClass}
                      placeholder="Mahalle, sokak, bina no, daire..."
                    />
                    {errors.address && <p className={errorClass}>{errors.address.message}</p>}
                  </div>
                </div>
              </div>

              {/* Ödeme Seçimi */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  Ödeme Yöntemi
                </h2>

                <div className="space-y-3 mb-5">
                  {[
                    { value: 'kredi', label: '💳 Kredi / Banka Kartı' },
                    { value: 'havale', label: '🏦 Havale / EFT' },
                    { value: 'kapida', label: '🚪 Kapıda Ödeme' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors
                        ${selectedPayment === opt.value ? `${BRAND.colors.primaryBorder} ${BRAND.colors.primaryLight}` : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register('paymentMethod')}
                        className="accent-green-600"
                      />
                      <span className="font-medium text-gray-800">{opt.label}</span>
                    </label>
                  ))}
                </div>

                {/* Kredi Kartı Alanları */}
                {selectedPayment === 'kredi' && (
                  <div className="border-t border-gray-100 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Kart Numarası</label>
                      <input
                        {...register('cardNumber')}
                        className={inputClass}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                      />
                      {errors.cardNumber && <p className={errorClass}>{errors.cardNumber.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Kart Üzerindeki İsim</label>
                      <input
                        {...register('cardName')}
                        className={inputClass}
                        placeholder="AD SOYAD"
                      />
                      {errors.cardName && <p className={errorClass}>{errors.cardName.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Son Kullanma Tarihi</label>
                      <input
                        {...register('cardExpiry')}
                        className={inputClass}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {errors.cardExpiry && <p className={errorClass}>{errors.cardExpiry.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>CVV</label>
                      <input
                        {...register('cardCvv')}
                        className={inputClass}
                        placeholder="CVV"
                        maxLength={4}
                        type="password"
                      />
                      {errors.cardCvv && <p className={errorClass}>{errors.cardCvv.message}</p>}
                    </div>
                  </div>
                )}

                {selectedPayment === 'havale' && (
                  <div className="border-t border-gray-100 pt-5 bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                    <p className="font-semibold mb-1">Havale / EFT Bilgileri</p>
                    <p>Banka: Ziraat Bankası</p>
                    <p>IBAN: TR00 0000 0000 0000 0000 0000 00</p>
                    <p>Hesap Sahibi: ALB Tarım Ltd. Şti.</p>
                    <p className="mt-2 text-xs text-blue-600">Açıklama: Sipariş numaranızı yazınız.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sağ: Sipariş Özeti */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  Sipariş Özeti
                </h2>

                {/* Ürünler */}
                <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate mr-2">
                        {item.product.name}{' '}
                        <span className="text-gray-400">×{item.quantity}</span>
                      </span>
                      <span className="font-medium text-gray-900 whitespace-nowrap">
                        {formatPrice(
                          (item.product.salePrice ?? item.product.price) *
                            item.quantity
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam</span>
                    <span>{formatPrice(araToplam)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Kargo</span>
                    <span className={kargoUcreti === 0 ? 'text-green-600 font-medium' : ''}>
                      {kargoUcreti === 0 ? 'Ücretsiz' : formatPrice(KARGO_UCRETI)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>KDV (%18)</span>
                    <span>{formatPrice(kdv)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between">
                    <span className="font-bold text-gray-900">Toplam</span>
                    <span className={`font-bold text-xl ${BRAND.colors.primaryText}`}>
                      {formatPrice(toplam)}
                    </span>
                  </div>
                </div>

                {/* SSL Badge */}
                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl py-2.5 px-4">
                  <span>🔒</span>
                  <span>SSL ile güvenli ödeme</span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || items.length === 0}
                  className={`mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${BRAND.colors.primary} ${BRAND.colors.primaryHover}`}
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    'Siparişi Tamamla'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
