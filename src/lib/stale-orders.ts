import { prisma } from '@/lib/db'
import { appendOrderNote } from '@/lib/order-note'
import { restoreStock } from '@/lib/stock'

/**
 * Ödemesi yarım kalmış siparişlerin temizliği.
 *
 * NEDEN AYRI BİR DOSYA: bu fonksiyon eskiden `src/app/actions/orders.ts`
 * içindeydi ve `userId`'yi parametre olarak alıyordu. O dosya `'use server'`
 * ile başladığı için fonksiyon tarayıcıdan çağrılabilir bir uç noktaydı ve
 * hiçbir doğrulama yapmıyordu — yani bir kullanıcının kimliğini bilen biri
 * başkasının bekleyen siparişlerini iptal edebiliyordu. Aynı dosyadaki diğer
 * bütün fonksiyonlar `getAuthUser()` ile başlıyor; bu ikisi gözden kaçmış.
 */

/** Ödemesi tamamlanmamış sipariş kaç saat sonra iptal edilir */
export const BEKLEYEN_SIPARIS_SAAT = 24

/**
 * Verilen kullanıcının eskimiş bekleyen siparişlerini iptal eder.
 * Yalnızca sunucudan çağrılır; `userId` çağıran tarafından oturumdan alınmalıdır.
 */
export async function cancelStalePendingOrders(userId: string): Promise<void> {
  const cutoff = new Date(Date.now() - BEKLEYEN_SIPARIS_SAAT * 3600_000)

  try {
    const stale = await prisma.order.findMany({
      where: {
        userId,
        status: 'PENDING',
        paymentStatus: { not: 'paid' },
        createdAt: { lt: cutoff },
      },
      select: { id: true },
      take: 100,
    })
    if (stale.length === 0) return

    await prisma.order.updateMany({
      where: { id: { in: stale.map((o) => o.id) } },
      data: { status: 'CANCELLED', paymentStatus: 'failed' },
    })

    // Rezerve edilen stoğu serbest bırak — aksi hâlde ödeme ekranını kapatan
    // her kullanıcı stoğu kalıcı olarak kilitlerdi.
    for (const o of stale) {
      await restoreStock(o.id, 'ödeme tamamlanmadı')
    }
  } catch (error) {
    // Temizlik işi; başarısız olursa sayfa yine de açılmalı
    console.error('[sipariş] bekleyen sipariş temizliği başarısız:', error)
  }
}

/**
 * TÜM kullanıcılar için aynı temizlik — zamanlanmış görev (cron) içindir.
 *
 * Kullanıcıya bağlı sürüm yalnızca müşteri kendi sipariş listesini açtığında
 * çalışıyor; ödeme ekranını kapatıp bir daha dönmeyen kullanıcıların
 * siparişleri yönetici listesinde sonsuza kadar birikiyordu.
 *
 * Kaç siparişin iptal edildiğini döndürür.
 */
export async function cancelAllStalePendingOrders(): Promise<number> {
  const cutoff = new Date(Date.now() - BEKLEYEN_SIPARIS_SAAT * 3600_000)

  const stale = await prisma.order.findMany({
    where: {
      status: 'PENDING',
      paymentStatus: { not: 'paid' },
      createdAt: { lt: cutoff },
    },
    select: { id: true },
    take: 500,
  })

  if (stale.length === 0) return 0

  await prisma.order.updateMany({
    where: { id: { in: stale.map((o) => o.id) } },
    data: { status: 'CANCELLED', paymentStatus: 'failed' },
  })

  for (const o of stale) {
    await restoreStock(o.id, 'ödeme tamamlanmadı')
    await appendOrderNote(o.id, 'Ödeme tamamlanmadığı için otomatik iptal edildi.')
  }

  return stale.length
}
