'use client'

import { usePathname } from 'next/navigation'
import { BRANDS } from '@/lib/constants'
import type { BrandKey } from '@/lib/types'

/**
 * URL pathname'den aktif marka key'ini döndürür.
 * /alb-tarim/* → 'alb-tarim'
 * /alb-su-aritma/* → 'alb-su-aritma'
 * Diğer sayfalar (sepet, hesabım vs.) → 'alb-tarim' (varsayılan)
 */
export function useBrandKey(): BrandKey {
  const pathname = usePathname()
  if (pathname.startsWith('/alb-su-aritma')) return 'alb-su-aritma'
  return 'alb-tarim'
}

/**
 * URL'den aktif BrandConfig objesini döndürür.
 */
export function useBrand() {
  const key = useBrandKey()
  return BRANDS[key]
}

/**
 * Verilen pathname için brand key'i döndürür (server-side kullanım için).
 */
export function getBrandKeyFromPath(pathname: string): BrandKey {
  if (pathname.startsWith('/alb-su-aritma')) return 'alb-su-aritma'
  return 'alb-tarim'
}
