import { prisma, type TransactionClient } from '@/lib/db'
import { refundPayment, cancelPayment } from '@/lib/iyzico'
import { notifyOrderRefunded } from '@/lib/email/notify'
import {
  completeReturnRequestsForOrder,
  completeSingleReturnRequest,
} from '@/lib/return-requests'
import { appendOrderNote } from '@/lib/order-note'

/**
 * Sipariş iadesi — TEK KAYNAK.
 *
 * Hem admin panelindeki "İade Et" butonu hem de müşterinin ödenmiş siparişi
 * iptal etmesi buradan geçer. Eskiden müşteri iptali hiçbir iade çağrısı
 * yapmıyor, stokları da geri yüklemiyordu.
 *
 * Kritik kural: **gateway başarısız olursa sipariş REFUNDED işaretlenmez.**
 * Aksi hâlde para müşteriye dönmeden sipariş "iade edildi" görünür ve durum
 * geri alınamaz hâle gelirdi.
 */

export type RefundOutcome =
  | { ok: true; message: string; gateway: 'cancel' | 'refund' }
  | { ok: false; error: string; needsManualReview: boolean }

interface RefundOptions {
  orderId: string
  ip?: string
  /** Gateway başarısız olsa bile siparişi REFUNDED yap (yalnızca admin, elle iade sonrası) */
  force?: boolean
  /** İade sebebi — admin notuna yazılır */
  reason?: string
  /**
   * KISMİ İADE: verilirse yalnızca bu iade talebindeki kalemler iade edilir.
   *
   * Eskiden böyle bir seçenek yoktu: müşteri 5 kalemlik siparişin 1 kalemi için
   * talep açsa bile `order.totalAmount`'ın TAMAMI iade ediliyor ve BÜTÜN
   * kalemlerin stoğu geri yükleniyordu. Doğrudan gelir kaybıydı.
   */
  returnRequestId?: string
}

/** Kısmi iadede sipariş REFUNDED olmaz; bu ara durumu alır. */
const KISMI_IADE_DURUMU = 'partially_refunded'

type TalepKalemi = { orderItemId: string; quantity: number }

function talepKalemleriniOku(raw: unknown): TalepKalemi[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((r) => {
      const o = r as { orderItemId?: unknown; quantity?: unknown }
      const id = typeof o?.orderItemId === 'string' ? o.orderItemId : null
      const qty = Number(o?.quantity)
      return id && Number.isInteger(qty) && qty > 0 ? { orderItemId: id, quantity: qty } : null
    })
    .filter((x): x is TalepKalemi => x !== null)
}

/** Kuruş hassasiyetinde yuvarlama */
function para(v: number): number {
  return Math.round((v + Number.EPSILON) * 100) / 100
}

export async function processRefund(options: RefundOptions): Promise<RefundOutcome> {
  const { orderId, ip = '127.0.0.1', force = false, reason, returnRequestId } = options

  // Kilitten önceki ödeme durumu — başarısızlıkta buraya geri dönülecek.
  const oncekiKayit = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true },
  })
  const oncekiOdemeDurumu = oncekiKayit?.paymentStatus ?? 'paid'

  // ── Kilitle: yalnızca ödenmiş ve henüz iade edilmemiş siparişi işleme al ──
  // Bu koşullu güncelleme, iki sekmeden aynı anda basılan "İade Et" butonunun
  // çift iadeye ve çift stok artışına yol açmasını engeller.
  const claimed = await prisma.order.updateMany({
    where: {
      id: orderId,
      // Kısmi iade sonrası sipariş `partially_refunded` durumunda kalıyor;
      // aynı siparişin ikinci bir kalemi de iade edilebilmeli.
      paymentStatus: returnRequestId ? { in: ['paid', KISMI_IADE_DURUMU] } : 'paid',
      status: { not: 'REFUNDED' },
    },
    data: { paymentStatus: 'refunding' },
  })

  if (claimed.count === 0) {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, paymentStatus: true },
    })

    if (!existing) return { ok: false, error: 'Sipariş bulunamadı.', needsManualReview: false }
    if (existing.status === 'REFUNDED' || existing.paymentStatus === 'refunded') {
      return { ok: false, error: 'Bu sipariş zaten iade edilmiş.', needsManualReview: false }
    }
    if (existing.paymentStatus === 'refunding') {
      return {
        ok: false,
        error: 'Bu sipariş için iade işlemi hâlihazırda sürüyor.',
        needsManualReview: false,
      }
    }
    return {
      ok: false,
      error: 'Bu sipariş için tahsil edilmiş bir ödeme yok.',
      needsManualReview: false,
    }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      paymentId: true,
      totalAmount: true,
      stockReduced: true,
      items: { select: { id: true, productId: true, quantity: true, totalPrice: true } },
      returnRequests: { select: { id: true, status: true, items: true } },
    },
  }) as {
    id: string
    orderNumber: string | null
    paymentId: string | null
    totalAmount: unknown
    stockReduced: boolean
    items: { id: string; productId: string; quantity: number; totalPrice: unknown }[]
    returnRequests: { id: string; status: string; items: unknown }[]
  } | null

  if (!order) {
    return { ok: false, error: 'Sipariş bulunamadı.', needsManualReview: false }
  }

  /** Başarısızlıkta kilidi bırak — sipariş tekrar denenebilir kalsın */
  async function releaseLock(note?: string) {
    await prisma.order
      .update({
        where: { id: orderId },
        // Kilitten önceki duruma dön. Kısmi iade denemesi başarısız olursa
        // sipariş `paid` değil, bulunduğu ara duruma dönmeli.
        data: { paymentStatus: oncekiOdemeDurumu },
      })
      .catch((e) => console.error('[iade] kilit bırakılamadı:', orderId, e))
    // Not, adminNote'u EZMEDEN ekleniyor
    if (note) await appendOrderNote(orderId, note)
  }

  // ── Kısmi iade hesabı ────────────────────────────────────────────────────
  const siparisToplami = para(Number(order.totalAmount))
  let kismi = false
  let iadeTutari = siparisToplami
  /** Stoğu geri yüklenecek kalemler */
  let iadeKalemleri = order.items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
  }))

  if (returnRequestId) {
    const talep = order.returnRequests.find((r) => r.id === returnRequestId)
    if (!talep) {
      await releaseLock()
      return { ok: false, error: 'İade talebi bu siparişe ait değil.', needsManualReview: false }
    }
    if (talep.status === 'COMPLETED' || talep.status === 'REJECTED') {
      await releaseLock()
      return { ok: false, error: 'Bu iade talebi zaten sonuçlandırılmış.', needsManualReview: false }
    }

    const secilen = talepKalemleriniOku(talep.items)
    const kalemHaritasi = new Map(order.items.map((i) => [i.id, i]))

    const eslesen = secilen
      .map((s) => {
        const kalem = kalemHaritasi.get(s.orderItemId)
        if (!kalem) return null
        const adet = Math.min(s.quantity, kalem.quantity)
        // Satır toplamından birim fiyat türetiliyor; ürün fiyatı sonradan
        // değişmiş olabilir, sipariş anındaki tutar esas alınmalı.
        const birim = Number(kalem.totalPrice) / kalem.quantity
        return { productId: kalem.productId, quantity: adet, tutar: para(birim * adet) }
      })
      .filter((x): x is { productId: string; quantity: number; tutar: number } => x !== null)

    if (eslesen.length === 0) {
      await releaseLock()
      return { ok: false, error: 'İade talebinde geçerli kalem yok.', needsManualReview: false }
    }

    const hesaplanan = para(eslesen.reduce((t, e) => t + e.tutar, 0))

    // Daha önce kısmi iade yapıldıysa toplam sipariş tutarını aşmasın
    const oncekiTamamlanan = order.returnRequests
      .filter((r) => r.status === 'COMPLETED')
      .flatMap((r) => talepKalemleriniOku(r.items))
      .reduce((t, s) => {
        const kalem = kalemHaritasi.get(s.orderItemId)
        if (!kalem) return t
        const birim = Number(kalem.totalPrice) / kalem.quantity
        return t + birim * Math.min(s.quantity, kalem.quantity)
      }, 0)

    if (para(oncekiTamamlanan + hesaplanan) > siparisToplami + 0.01) {
      await releaseLock(
        `Kısmi iade reddedildi: talep tutarı (${hesaplanan} TL) önceki iadelerle birlikte ` +
          `sipariş tutarını (${siparisToplami} TL) aşıyor.`,
      )
      return {
        ok: false,
        error: 'İade tutarı sipariş tutarını aşıyor. Siparişi elle kontrol edin.',
        needsManualReview: true,
      }
    }

    // Talep siparişin BÜTÜN kalemlerini TAM adetle kapsıyor mu?
    // Kapsıyorsa bu bir tam iadedir ve KARGO BEDELİ de iade edilmelidir
    // (Mesafeli Sözleşmeler Yönetmeliği: tam cayma hâlinde teslim masrafı da
    // iade edilir). Kalem toplamı sipariş toplamından kargo kadar düşük
    // olduğu için, bunu kontrol etmeden "kısmi iade" sanılırdı.
    const talepAdetleri = new Map<string, number>()
    for (const e of eslesen) talepAdetleri.set(e.productId, (talepAdetleri.get(e.productId) ?? 0) + e.quantity)
    const tumKalemlerKapsandi = order.items.every(
      (i) => (talepAdetleri.get(i.productId) ?? 0) >= i.quantity,
    )

    if (tumKalemlerKapsandi && oncekiTamamlanan === 0) {
      iadeTutari = siparisToplami
      kismi = false
    } else {
      iadeTutari = hesaplanan
      kismi = true
    }

    iadeKalemleri = eslesen.map((e) => ({ productId: e.productId, quantity: e.quantity }))
  }

  // ── Gateway ──────────────────────────────────────────────────────────────
  let gateway: 'cancel' | 'refund' | null = null
  let gatewayError = 'Ödeme sağlayıcısına ulaşılamadı.'

  if (!order.paymentId) {
    if (!force) {
      await releaseLock(
        'İade denendi ancak siparişte ödeme kimliği (paymentId) yok. Ödeme iyzico panelinden elle iade edilmeli.',
      )
      return {
        ok: false,
        error:
          'Bu siparişte ödeme kimliği kayıtlı değil; otomatik iade yapılamıyor. iyzico panelinden elle iade edip "elle iade edildi" seçeneğiyle işaretleyin.',
        needsManualReview: true,
      }
    }
  } else {
    const amount = iadeTutari.toFixed(2)

    // Önce aynı gün iptali (komisyon iadesi de alınır), olmazsa iade.
    //
    // KISMİ İADEDE İPTAL DENENMİYOR: `cancelPayment` her zaman ödemenin
    // TAMAMINI iptal eder. Kısmi iadede kullanılırsa müşteriye tüm sipariş
    // tutarı geri gider — düzeltmeye çalıştığımız hatanın ta kendisi.
    if (!kismi) {
      try {
        const cancelled = await cancelPayment({
          paymentId: order.paymentId,
          conversationId: order.orderNumber ?? order.id,
          ip,
        })
        if (cancelled?.status === 'success') gateway = 'cancel'
        else if (cancelled?.errorMessage) gatewayError = String(cancelled.errorMessage)
      } catch (error) {
        // Ağ/istisna hatası iadeyi engellemesin — aşağıda refund denenir
        console.error('[iade] iptal çağrısı başarısız:', orderId, error)
      }
    }

    if (!gateway) {
      try {
        const refunded = await refundPayment({
          paymentId: order.paymentId,
          price: amount,
          conversationId: order.orderNumber ?? order.id,
          ip,
        })
        if (refunded?.status === 'success') gateway = 'refund'
        else if (refunded?.errorMessage) gatewayError = String(refunded.errorMessage)
      } catch (error) {
        console.error('[iade] iade çağrısı başarısız:', orderId, error)
      }
    }

    if (!gateway && !force) {
      await releaseLock(`İade başarısız: ${gatewayError} (${new Date().toISOString()})`)
      return {
        ok: false,
        error: `Ödeme sağlayıcısı iadeyi reddetti: ${gatewayError}. Sipariş değiştirilmedi; iyzico panelinden kontrol edin.`,
        needsManualReview: true,
      }
    }
  }

  // ── Stokları geri yükle + siparişi kapat ─────────────────────────────────
  const gatewayAciklamasi =
    gateway === 'cancel'
      ? 'Ödeme aynı gün iptaliyle iade edildi.'
      : gateway === 'refund'
        ? 'Ödeme iyzico üzerinden iade edildi.'
        : 'Elle iade olarak işaretlendi (gateway çağrısı yapılmadı/başarısız).'

  try {
    await prisma.$transaction(async (tx: TransactionClient) => {
      // ── `stockReduced` İŞLEM İÇİNDE yeniden okunuyor ────────────────────
      //
      // Yukarıdaki `order` nesnesi, iyzico'ya yapılan ağ çağrılarından ÖNCE
      // okunmuştu. O çağrılar saniyeler sürebiliyor ve arada müşteri siparişi
      // iptal edip stoğu geri yükletmiş olabilir. Bayat anlık görüntüyle
      // devam edilirse stok ikinci kez artıyor — yani envanterde olmayan mal
      // görünüyor ve satılamayacak ürün satılıyor.
      //
      // Kalan yarış aralığı yalnızca bu işlemin süresi kadar; tam kilit için
      // satır kilidi (SELECT ... FOR UPDATE) gerekir, o da ham SQL demek.
      // Buradaki kazanç/karmaşıklık dengesi bu okumadan yana.
      const guncel = await tx.order.findUnique({
        where: { id: order.id },
        select: { stockReduced: true },
      })

      // Stok yalnızca İADE EDİLEN kalemler için geri yükleniyor. Eskiden
      // koşulsuz olarak siparişin bütün kalemleri artırılıyordu.
      if (guncel?.stockReduced) {
        for (const item of iadeKalemleri) {
          await tx.product.updateMany({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          })
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: kismi
          ? {
              // Kısmi iadede sipariş REFUNDED OLMAZ: müşterinin elinde kalan
              // kalemler var, sipariş "iade edildi" görünmemeli.
              paymentStatus: KISMI_IADE_DURUMU,
              // Kalan kalemlerin stoğu hâlâ düşülmüş durumda
              stockReduced: guncel?.stockReduced ?? order.stockReduced,
            }
          : {
              status: 'REFUNDED',
              paymentStatus: 'refunded',
              stockReduced: false,
            },
      })
    })
  } catch (error) {
    console.error('[iade] DB güncellenemedi (para iade EDİLDİ):', orderId, error)
    return {
      ok: false,
      error:
        'Para iade edildi ancak sipariş kaydı güncellenemedi. Lütfen siparişi elle kontrol edin.',
      needsManualReview: true,
    }
  }

  // Yönetici notu — var olanı ezmeden
  await appendOrderNote(
    orderId,
    [
      kismi ? `KISMİ İADE: ${iadeTutari.toFixed(2)} TL` : `İADE: ${iadeTutari.toFixed(2)} TL`,
      reason ? `Sebep: ${reason}` : null,
      gatewayAciklamasi,
    ]
      .filter(Boolean)
      .join(' · '),
  )

  // Açık iade talebi varsa kapat — yönetici ayrıca kapatmak zorunda kalmasın.
  // Kısmi iadede YALNIZCA işlenen talep kapatılır; siparişin diğer açık
  // talepleri (varsa) dokunulmadan kalır.
  if (returnRequestId) {
    await completeSingleReturnRequest(returnRequestId)
  } else {
    await completeReturnRequestsForOrder(orderId)
  }

  // Müşteriye iade bildirimi — gönderilemezse iade yine de geçerli
  await notifyOrderRefunded(orderId, reason, iadeTutari)

  const tutarMetni = `${iadeTutari.toFixed(2)} TL`

  return {
    ok: true,
    gateway: gateway ?? 'refund',
    message: kismi
      ? `Kısmi iade yapıldı: ${tutarMetni}. Siparişin kalan kalemleri etkilenmedi.`
      : gateway === 'cancel'
        ? `Ödeme iptal edildi, ${tutarMetni} müşteriye iade edilecek.`
        : gateway === 'refund'
          ? `İade talebi iyzico'ya iletildi, ${tutarMetni} müşteriye iade edilecek.`
          : `Sipariş elle iade edilmiş olarak işaretlendi (${tutarMetni}).`,
  }
}
