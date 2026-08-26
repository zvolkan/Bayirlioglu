'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { notifyContactMessage, notifyDealerApplication } from '@/lib/email/form-notify'

/**
 * İletişim ve bayi başvuru formları.
 *
 * Eskiden dört form da `setTimeout` ile sahte bir başarı mesajı gösterip
 * veriyi `console.log`'a yazıyordu — gelen hiçbir mesaj ve başvuru
 * kaydedilmiyordu. Artık veritabanına yazılıyor.
 */

export type FormResult = { ok: true } | { ok: false; error: string }

// ─── Basit hız sınırı ────────────────────────────────────────────────────────
// Sunucusuz ortamda örnek başına tutulur; bot spam'ini tamamen engellemez ama
// aynı oturumdan arka arkaya gönderimi belirgin şekilde zorlaştırır.

const RATE_WINDOW_MS = 60 * 1000
const RATE_MAX = 3
const submissions = new Map<string, { count: number; firstAt: number }>()

function allowSubmission(key: string): boolean {
  const now = Date.now()
  const record = submissions.get(key)
  if (!record || now - record.firstAt > RATE_WINDOW_MS) {
    submissions.set(key, { count: 1, firstAt: now })
    return true
  }
  record.count += 1
  return record.count <= RATE_MAX
}

// ─── İletişim formu ──────────────────────────────────────────────────────────

const contactSchema = z.object({
  firstName: z.string().trim().min(2, 'Ad en az 2 karakter olmalıdır').max(100),
  lastName: z.string().trim().min(2, 'Soyad en az 2 karakter olmalıdır').max(100),
  email: z.string().trim().email('Geçerli bir e-posta adresi girin').max(255),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  subject: z.string().trim().max(150).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Mesaj en az 10 karakter olmalıdır').max(5000),
  brandKey: z.string().trim().max(30).optional().or(z.literal('')),
  // Bot tuzağı: gerçek kullanıcı bu alanı doldurmaz
  website: z.string().max(0).optional().or(z.literal('')),
})

export type ContactInput = z.input<typeof contactSchema>

export async function submitContactMessage(input: ContactInput): Promise<FormResult> {
  const parsed = contactSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form bilgileri geçersiz.' }
  }

  const data = parsed.data

  // Honeypot doluysa sessizce başarılı gibi dön (bota ipucu verme)
  if (data.website) return { ok: true }

  if (!allowSubmission(`contact:${data.email}`)) {
    return { ok: false, error: 'Çok fazla mesaj gönderdiniz. Lütfen birkaç dakika sonra deneyin.' }
  }

  try {
    await prisma.contactMessage.create({
      data: {
        brandKey: data.brandKey || null,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        subject: data.subject || null,
        message: data.message,
      },
    })

    // Yöneticiye bildirim — gönderilemezse mesaj yine kaydedilmiş olur.
    // Eskiden hiç bildirim gitmiyordu; panele bakılmazsa mesaj görülmüyordu.
    await notifyContactMessage({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      brandKey: data.brandKey,
    })

    return { ok: true }
  } catch (error) {
    console.error('[form] iletişim mesajı kaydedilemedi:', error)
    return {
      ok: false,
      error: 'Mesajınız kaydedilemedi. Lütfen tekrar deneyin veya telefonla ulaşın.',
    }
  }
}

// ─── Bayi başvurusu ──────────────────────────────────────────────────────────

const dealerSchema = z.object({
  companyName: z.string().trim().min(2, 'Firma adı gerekli').max(200),
  firstName: z.string().trim().min(2, 'Ad en az 2 karakter olmalıdır').max(100),
  lastName: z.string().trim().min(2, 'Soyad en az 2 karakter olmalıdır').max(100),
  email: z.string().trim().email('Geçerli bir e-posta adresi girin').max(255),
  phone: z.string().trim().min(10, 'Geçerli bir telefon numarası girin').max(30),
  city: z.string().trim().min(2, 'İl seçin').max(100),
  district: z.string().trim().max(100).optional().or(z.literal('')),
  brandInterest: z.string().trim().max(60).optional().or(z.literal('')),
  businessType: z.string().trim().max(80).optional().or(z.literal('')),
  annualRevenue: z.string().trim().max(80).optional().or(z.literal('')),
  message: z.string().trim().max(5000).optional().or(z.literal('')),
  website: z.string().max(0).optional().or(z.literal('')),
})

export type DealerInput = z.input<typeof dealerSchema>

export async function submitDealerApplication(input: DealerInput): Promise<FormResult> {
  const parsed = dealerSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form bilgileri geçersiz.' }
  }

  const data = parsed.data

  if (data.website) return { ok: true }

  if (!allowSubmission(`dealer:${data.email}`)) {
    return { ok: false, error: 'Çok fazla başvuru gönderdiniz. Lütfen birkaç dakika sonra deneyin.' }
  }

  try {
    await prisma.dealerApplication.create({
      data: {
        companyName: data.companyName,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        city: data.city,
        district: data.district || null,
        brandInterest: data.brandInterest || null,
        businessType: data.businessType || null,
        annualRevenue: data.annualRevenue || null,
        message: data.message || null,
      },
    })

    await notifyDealerApplication({
      companyName: data.companyName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      city: data.city,
      district: data.district,
      brandInterest: data.brandInterest,
      businessType: data.businessType,
      annualRevenue: data.annualRevenue,
      message: data.message,
    })

    return { ok: true }
  } catch (error) {
    console.error('[form] bayi başvurusu kaydedilemedi:', error)
    return {
      ok: false,
      error: 'Başvurunuz kaydedilemedi. Lütfen tekrar deneyin veya telefonla ulaşın.',
    }
  }
}
