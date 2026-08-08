'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { prisma, type TransactionClient } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { processRefund } from '@/lib/refund'

// ─── Oturum kontrolü ─────────────────────────────────────────────────────────

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')
  return user
}

// ─── Kullanılmayan sipariş sorguları KALDIRILDI ──────────────────────────────
//
// `getUserOrders` ve `getLastOrder` hiçbir yerden çağrılmıyordu; sayfalar
// Prisma'yı doğrudan sorguluyor. `'use server'` dosyasında export edildikleri
// için kullanılmasalar da dışarıdan POST edilebilen birer uç noktaydılar.

// ─── Sipariş oluşturma KALDIRILDI ────────────────────────────────────────────
//
// Buradaki `createOrder` hiçbir yerden çağrılmıyordu ama `'use server'`
// dosyasında export edildiği için herkesin POST edebileceği açık bir uç
// noktaydı. Tutarı İSTEMCİDEN gelen `unitPrice` ile hesaplıyor, stok/fiyat/
// marka doğrulaması yapmıyordu — giriş yapmış herhangi biri veritabanını
// sahte siparişlerle doldurabilirdi.
//
// Gerçek sipariş oluşturma `src/app/api/odeme/initialize/route.ts` içinde,
// fiyatlar veritabanından okunarak yapılıyor.

// ─── Son siparişi tekrarla — sepete ekle ─────────────────────────────────────
// Geçen yılın siparişindeki ürünleri (aktif ve stokta olanları) döndürür.
// Frontend bu listeyi sepete ekleyecek.

export async function getRepeatOrderItems(orderId: string) {
  const user = await getAuthUser()

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              salePrice: true,
              unit: true,
              isActive: true,
              stockQuantity: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
  })

  if (!order) return null

  // Sadece hâlâ aktif ve stokta olan ürünleri döndür
  const available = order.items.filter(
    (item) => item.product.isActive && item.product.stockQuantity > 0
  )

  return {
    orderId: order.id,
    createdAt: order.createdAt,
    available,
    unavailable: order.items.filter(
      (item) => !item.product.isActive || item.product.stockQuantity === 0
    ),
  }
}

// ─── Sipariş iptal et ────────────────────────────────────────────────────────

export type CancelOrderResult = { ok: true; message: string } | { ok: false; error: string }

/**
 * Müşterinin sipariş iptali.
 *
 * ÖNEMLİ: Ödemesi alınmış (CONFIRMED) bir sipariş iptal edilirken önce para
 * iade edilir ve stoklar geri yüklenir. Eskiden yalnızca durum CANCELLED
 * yapılıyordu: müşterinin parası iade edilmiyor, düşülen stok da geri
 * gelmiyordu.
 */
export async function cancelOrder(orderId: string): Promise<CancelOrderResult> {
  const user = await getAuthUser()

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    select: { id: true, status: true, paymentStatus: true },
  })

  if (!order) return { ok: false, error: 'Sipariş bulunamadı.' }

  const cancellable = ['PENDING', 'CONFIRMED']
  if (!cancellable.includes(order.status)) {
    return {
      ok: false,
      error: 'Bu sipariş hazırlanmaya başlandığı için artık iptal edilemiyor.',
    }
  }

  // Ödemesi alınmışsa iade akışından geçir
  if (order.paymentStatus === 'paid') {
    const headerList = await headers()
    const ip = (headerList.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()

    const result = await processRefund({
      orderId,
      ip,
      reason: 'Müşteri talebiyle iptal',
    })

    revalidatePath('/hesabim/siparislerim')
    revalidatePath('/hesabim')

    if (!result.ok) {
      return {
        ok: false,
        error:
          'İptal işlemi tamamlanamadı. Lütfen bizimle iletişime geçin, siparişinizi ekibimiz iptal edecek.',
      }
    }

    return {
      ok: true,
      message:
        'Siparişiniz iptal edildi. Ödemeniz bankanıza iade edildi; hesabınıza yansıması 1-7 iş günü sürebilir.',
    }
  }

  // Ödeme alınmamış (PENDING) sipariş — doğrudan iptal
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED', paymentStatus: 'cancelled' },
  })

  revalidatePath('/hesabim/siparislerim')
  revalidatePath('/hesabim')

  return { ok: true, message: 'Siparişiniz iptal edildi.' }
}

// ─── Profil güncelle ─────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData): Promise<FormResult> {
  const user = await getAuthUser()

  const name = ((formData.get('name') as string) ?? '').trim().slice(0, 150)
  const phone = ((formData.get('phone') as string) ?? '').trim().slice(0, 20)

  if (name && name.length < 2) {
    return { ok: false, error: 'Ad soyad en az 2 karakter olmalıdır.' }
  }
  if (phone && phone.replace(/\D/g, '').length < 10) {
    return { ok: false, error: 'Geçerli bir telefon numarası girin.' }
  }

  // Kullanıcı satırı yoksa oluştur — Supabase kaydı ile DB senkron değilse
  // update P2025 hatası verip 500 dönüyordu.
  await prisma.user.upsert({
    where: { id: user.id },
    update: { name: name || null, phone: phone || null },
    create: {
      id: user.id,
      email: user.email ?? '',
      name: name || null,
      phone: phone || null,
    },
  })

  revalidatePath('/hesabim')
  return { ok: true }
}


/**
 * Form işlemlerinin ortak dönüş tipi.
 *
 * Bu aksiyonlar eskiden `return 'Geçerli bir telefon numarası girin.'`
 * yapıyordu. Next.js üretim derlemesinde sunucu aksiyonundan fırlatılan hata
 * mesajını GİZLİYOR; istemciye yalnızca anlamsız bir digest ulaşıyor. Sonuçta
 * kullanıcı hangi alanın hatalı olduğunu asla öğrenemiyor, formu dolduramıyordu.
 * Bu yüzden hata fırlatmak yerine sonuç nesnesi dönülüyor.
 */
export type FormResult = { ok: true } | { ok: false; error: string }

// ─── Adres doğrulama ─────────────────────────────────────────────────────────

interface AddressInput {
  label: string
  fullName: string
  phone: string
  line1: string
  line2: string | null
  district: string
  city: string
  postalCode: string | null
}

/**
 * Adres formunu doğrular ve sütun sınırlarına kırpar.
 * Eskiden `formData.get(...) as string` doğrudan Prisma'ya gidiyordu; boş alan
 * null hatası, uzun alan da P2000 ("value too long") hatası veriyordu.
 */
function parseAddressForm(formData: FormData): AddressInput | string {
  const text = (key: string, max: number) =>
    ((formData.get(key) as string | null) ?? '').trim().slice(0, max)

  const fullName = text('fullName', 150)
  const phone = text('phone', 20)
  const line1 = text('line1', 255)
  const district = text('district', 100)
  const city = text('city', 100)

  if (fullName.length < 2) return 'Ad soyad en az 2 karakter olmalıdır.'
  if (phone.replace(/\D/g, '').length < 10) return 'Geçerli bir telefon numarası girin.'
  if (line1.length < 5) return 'Adres en az 5 karakter olmalıdır.'
  if (district.length < 2) return 'İlçe bilgisi gereklidir.'
  if (city.length < 2) return 'İl bilgisi gereklidir.'

  return {
    label: text('label', 50) || 'Adresim',
    fullName,
    phone,
    line1,
    line2: text('line2', 255) || null,
    district,
    city,
    postalCode: text('postalCode', 10) || null,
  }
}

// ─── Adres ekle ──────────────────────────────────────────────────────────────

export async function addAddress(formData: FormData): Promise<FormResult> {
  const user = await getAuthUser()

  const parsed = parseAddressForm(formData)
  if (typeof parsed === 'string') return { ok: false, error: parsed }
  const input = parsed
  const isDefault = formData.get('isDefault') === 'on'

  // İlk adres otomatik varsayılan olsun
  const existingCount = await prisma.address.count({ where: { userId: user.id } })
  const makeDefault = isDefault || existingCount === 0

  // Varsayılan sıfırlama + oluşturma tek transaction: biri başarısız olursa
  // kullanıcı varsayılan adressiz kalmasın
  await prisma.$transaction(async (tx: TransactionClient) => {
    if (makeDefault) {
      await tx.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      })
    }

    await tx.address.create({
      data: { ...input, userId: user.id, isDefault: makeDefault },
    })
  })

  revalidatePath('/hesabim')
  revalidatePath('/hesabim/adreslerim')
  return { ok: true }
}

// ─── Adres güncelle ──────────────────────────────────────────────────────────

export async function updateAddress(addressId: string, formData: FormData): Promise<FormResult> {
  const user = await getAuthUser()

  // `addAddress` doğrulamadan geçiyordu ama burada ham değerler doğrudan
  // Prisma'ya yazılıyordu: boş ad soyad null hatası, 300 karakterlik adres
  // P2000 hatası veriyordu. Aynı doğrulayıcı kullanılıyor.
  const parsed = parseAddressForm(formData)
  if (typeof parsed === 'string') return { ok: false, error: parsed }
  const input = parsed
  const isDefault = formData.get('isDefault') === 'on'

  await prisma.$transaction(async (tx: TransactionClient) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      })
    }

    await tx.address.updateMany({
      where: { id: addressId, userId: user.id },
      data: { ...input, isDefault },
    })
  })

  revalidatePath('/hesabim')
  revalidatePath('/hesabim/adreslerim')
  return { ok: true }
}

// ─── Adres sil ────────────────────────────────────────────────────────────────

export async function deleteAddress(addressId: string) {
  const user = await getAuthUser()

  const deleted = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
    select: { isDefault: true },
  })

  await prisma.address.deleteMany({
    where: { id: addressId, userId: user.id },
  })

  // Varsayılan adres silindiyse kalanlardan birini varsayılan yap
  if (deleted?.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } })
    }
  }

  revalidatePath('/hesabim')
  revalidatePath('/hesabim/adreslerim')
}

// ─── Varsayılan adres yap ─────────────────────────────────────────────────────

export async function setDefaultAddress(addressId: string) {
  const user = await getAuthUser()

  const owned = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
    select: { id: true },
  })
  if (!owned) return

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ])

  revalidatePath('/hesabim')
  revalidatePath('/hesabim/adreslerim')
}

// ─── Yarım kalan ödemeleri temizle ───────────────────────────────────────────

/** Ödemesi tamamlanmayan siparişin geçerli sayılacağı süre */
const BEKLEYEN_SIPARIS_SAAT = 24

/**
 * Ödeme ekranını kapatan kullanıcının siparişi sonsuza kadar "Beklemede"
 * kalıyordu: listede birikiyor, müşteri ne yapacağını bilemiyordu. Kullanıcı
 * kendi sipariş listesini açtığında eskimiş olanlar iptal ediliyor.
 *
 * Yalnızca ödemesi HİÇ alınmamış siparişlere dokunulur — para tahsil edilmiş
 * bir siparişin buradan iptal edilmesi mümkün değil.
 */
export async function cancelStalePendingOrders(userId: string): Promise<void> {
  const cutoff = new Date(Date.now() - BEKLEYEN_SIPARIS_SAAT * 3600_000)

  try {
    await prisma.order.updateMany({
      where: {
        userId,
        status: 'PENDING',
        paymentStatus: { not: 'paid' },
        createdAt: { lt: cutoff },
      },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'failed',
        adminNote: 'Ödeme tamamlanmadığı için otomatik iptal edildi.',
      },
    })
  } catch (error) {
    // Temizlik işi; başarısız olursa sayfa yine de açılmalı
    console.error('[sipariş] bekleyen sipariş temizliği başarısız:', error)
  }
}
