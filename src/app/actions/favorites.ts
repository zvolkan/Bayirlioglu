'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

/**
 * Favoriler.
 *
 * Eskiden ProductCard'daki kalp yalnızca `useState` ile çalışıyordu; sayfa
 * yenilenince kayboluyordu ve /hesabim/favorilerim herkese aynı 3 sahte ürünü
 * gösteriyordu. Artık Favorite tablosuna yazılıyor.
 */

async function getUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export type ToggleFavoriteResult =
  | { ok: true; isFavorite: boolean }
  | { ok: false; reason: 'auth' | 'error' }

/** Favoriye ekler veya çıkarır. Dönen değer son durumu bildirir. */
export async function toggleFavorite(productId: string): Promise<ToggleFavoriteResult> {
  const userId = await getUserId()
  if (!userId) return { ok: false, reason: 'auth' }

  if (!productId || typeof productId !== 'string') {
    return { ok: false, reason: 'error' }
  }

  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    })

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      revalidatePath('/hesabim/favorilerim')
      return { ok: true, isFavorite: false }
    }

    // Ürün gerçekten var mı?
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    })
    if (!product) return { ok: false, reason: 'error' }

    await prisma.favorite.create({ data: { userId, productId } })
    revalidatePath('/hesabim/favorilerim')
    return { ok: true, isFavorite: true }
  } catch (error) {
    console.error('[favorites] toggle hatası:', error)
    return { ok: false, reason: 'error' }
  }
}

/** Favoriden çıkarır (favoriler sayfasındaki "kaldır" butonu için) */
export async function removeFavorite(productId: string): Promise<{ ok: boolean }> {
  const userId = await getUserId()
  if (!userId) return { ok: false }

  try {
    await prisma.favorite.deleteMany({ where: { userId, productId } })
    revalidatePath('/hesabim/favorilerim')
    return { ok: true }
  } catch (error) {
    console.error('[favorites] silme hatası:', error)
    return { ok: false }
  }
}

/** Kullanıcının favori ürün id'leri — kart listelerinde kalbi dolu göstermek için */
export async function getFavoriteIds(): Promise<Set<string>> {
  const userId = await getUserId()
  if (!userId) return new Set()

  try {
    const rows = await prisma.favorite.findMany({
      where: { userId },
      select: { productId: true },
    })
    return new Set(rows.map((r: { productId: string }) => r.productId))
  } catch (error) {
    console.error('[favorites] liste hatası:', error)
    return new Set()
  }
}

/** Favori ürünlerin tamamı (favoriler sayfası için) */
export async function getFavoriteProducts() {
  const userId = await getUserId()
  if (!userId) return []

  try {
    const rows = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    })
    return rows.filter((r: { product: unknown }) => r.product !== null)
  } catch (error) {
    console.error('[favorites] ürün listesi hatası:', error)
    return []
  }
}
