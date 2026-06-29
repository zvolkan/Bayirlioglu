'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { BRAND } from '@/lib/constants'

const schema = z
  .object({
    firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi girin'),
    phone: z
      .string()
      .regex(/^(\+90|0)?[0-9]{10}$/, 'Geçerli bir telefon numarası girin'),
    password: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .regex(/[A-Z]/, 'En az bir büyük harf içermelidir')
      .regex(/[0-9]/, 'En az bir rakam içermelidir')
      .regex(/[^A-Za-z0-9]/, 'En az bir özel karakter içermelidir'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Koşulları kabul etmeniz gerekmektedir' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: 'bg-gray-200' }

  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: 'Zayıf', color: 'bg-red-500' }
  if (score === 2) return { score: 2, label: 'Orta', color: 'bg-yellow-500' }
  if (score === 3) return { score: 3, label: 'İyi', color: 'bg-blue-500' }
  return { score: 4, label: 'Güçlü', color: 'bg-green-500' }
}

export default function KayitPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const watchedPassword = watch('password', '')

  useEffect(() => {
    setPasswordValue(watchedPassword ?? '')
  }, [watchedPassword])

  const strength = getPasswordStrength(passwordValue)

  const onSubmit = async (data: FormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('Kayıt verisi:', data)
  }

  const EyeIcon = ({ visible }: { visible: boolean }) =>
    visible ? (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="max-w-md mx-auto">
          {/* Logo + Başlık */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${BRAND.colors.logoBg}`}
            >
              <span className={`text-2xl font-bold ${BRAND.colors.primaryText}`}>
                {BRAND.shortName?.charAt(0) ?? 'A'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Hesap Oluşturun</h1>
            <p className="text-gray-500 mt-1 text-sm">{BRAND.name} müşteri portalına katılın</p>
          </div>

          {/* Kart */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Ad + Soyad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad</label>
                  <input
                    {...register('firstName')}
                    type="text"
                    autoComplete="given-name"
                    placeholder="Ahmet"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-200 placeholder-gray-400"
                  />
                  {errors.firstName && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Soyad</label>
                  <input
                    {...register('lastName')}
                    type="text"
                    autoComplete="family-name"
                    placeholder="Yıldız"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-200 placeholder-gray-400"
                  />
                  {errors.lastName && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* E-posta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  E-posta Adresi
                </label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-200 placeholder-gray-400"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Telefon Numarası
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  autoComplete="tel"
                  placeholder="05XX XXX XX XX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-200 placeholder-gray-400"
                />
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Şifre</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="En az 8 karakter"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-200 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
                {/* Şifre Gücü Progress Bar */}
                {passwordValue && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            strength.score >= level ? strength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Şifre gücü:{' '}
                      <span
                        className={`font-medium ${
                          strength.score <= 1
                            ? 'text-red-500'
                            : strength.score === 2
                            ? 'text-yellow-600'
                            : strength.score === 3
                            ? 'text-blue-600'
                            : 'text-green-600'
                        }`}
                      >
                        {strength.label}
                      </span>
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Şifre Tekrar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Şifrenizi tekrar girin"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-200 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    <EyeIcon visible={showConfirmPassword} />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* KVKK + Kullanım Koşulları */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    {...register('acceptTerms')}
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500 shrink-0"
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    <Link href="/kvkk" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                      KVKK Aydınlatma Metni
                    </Link>
                    {' '}ve{' '}
                    <Link href="/kullanim-kosullari" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                      Kullanım Koşulları
                    </Link>
                    'nı okudum ve kabul ediyorum.
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.acceptTerms.message}</p>
                )}
              </div>

              {/* Kayıt Ol Butonu */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-200 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Kayıt oluşturuluyor...
                  </span>
                ) : (
                  'Kayıt Ol'
                )}
              </button>
            </form>

            {/* Giriş Yap Linki */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Zaten hesabın var mı?{' '}
              <Link
                href="/giris"
                className="text-green-600 hover:text-green-700 font-semibold transition-colors"
              >
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
