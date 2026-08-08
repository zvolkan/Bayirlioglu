'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { toggleFavorite } from '@/app/actions/favorites'
import Icon from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

/**
 * Favoriye ekle / çıkar.
 *
 * Bu buton eskiden hiç yoktu: `toggleFavorite` sunucu aksiyonu yazılmış ama
 * hiçbir bileşen onu çağırmıyordu. Sonuç olarak /hesabim/favorilerim sayfası
 * herkeste kalıcı olarak boştu ve sayfadaki "kalp simgesine dokunun"
 * yönergesi uygulanamıyordu — dokunulacak bir kalp yoktu.
 *
 * Giriş yapmamış kullanıcıya hata göstermek yerine giriş sayfasına
 * yönlendiriyoruz; dönüşte kaldığı yere gelsin diye adresi taşıyoruz.
 */

interface Props {
  productId: string
  /** Sunucudan gelen başlangıç durumu (liste sorgusunda biliniyorsa) */
  initial?: boolean
  className?: string
  /** Kart üzerinde küçük, ürün detayında büyük */
  size?: 'sm' | 'lg'
}

export default function FavoriteButton({
  productId,
  initial = false,
  className,
  size = 'sm',
}: Props) {
  const [isFavorite, setIsFavorite] = useState(initial)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    // Kart tamamen <Link> içinde olabiliyor
    e.preventDefault()
    e.stopPropagation()

    // İyimser güncelleme — istek dönmeden kalp doluyor
    const next = !isFavorite
    setIsFavorite(next)

    startTransition(async () => {
      const result = await toggleFavorite(productId)

      if (result.ok) {
        setIsFavorite(result.isFavorite)
        return
      }

      setIsFavorite(!next) // geri al

      if (result.reason === 'auth') {
        toast('Favorilere eklemek için giriş yapın.')
        const back = encodeURIComponent(window.location.pathname + window.location.search)
        router.push(`/giris?redirect=${back}`)
        return
      }
      toast.error('Favori kaydedilemedi, lütfen tekrar deneyin.')
    })
  }

  const box = size === 'lg' ? 'w-11 h-11' : 'w-9 h-9'
  const glyph = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      className={cn(
        box,
        'inline-flex items-center justify-center rounded-full border bg-white/90 backdrop-blur-sm',
        'transition-colors disabled:opacity-60',
        isFavorite
          ? 'border-red-200 text-red-500 hover:bg-red-50'
          : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200',
        className,
      )}
    >
      <Icon
        name="favori"
        className={cn(glyph, isFavorite && 'fill-current')}
      />
    </button>
  )
}
