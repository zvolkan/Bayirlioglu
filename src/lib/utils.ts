import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Genel yardımcılar.
 *
 * Bu dosya 17 export ile başlamıştı; 14'ü hiçbir yerden çağrılmıyordu
 * (tarih biçimlendirme, stok kontrolü, sipariş numarası üretme, okuma süresi
 * hesabı vb.). Kullanılmayan yardımcıların durması, aynı işi yapan kodun
 * sayfalara elle yazılmasına yol açıyordu — "zaten bir yerde var" sanılıyor
 * ama import edilmiyordu. Yalnızca gerçekten kullanılanlar kaldı.
 */

// ─── TAILWIND SINIF BİRLEŞTİRİCİ ────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── PARA BİRİMİ ─────────────────────────────────────────────────────────────

export function formatPrice(amount: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── SLUG ────────────────────────────────────────────────────────────────────

/**
 * Türkçe karakterleri doğru çeviren slug üreteci.
 *
 * DİKKAT: Büyük harf eşlemesi (`İ → I`, `Ç → C`) küçültmeden ÖNCE yapılıyor.
 * Admin ürün formunda ayrı bir kopya vardı ve bu adımı atlıyordu; JavaScript'in
 * `toLowerCase()` metodu "İ" harfini iki kod noktasına açtığı için
 * "İSTANBUL" gibi bir ad `-stanbul` şeklinde bozuk adrese dönüşüyordu.
 */
export function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: 'c', Ç: 'C', ğ: 'g', Ğ: 'G', ı: 'i', İ: 'I',
    ö: 'o', Ö: 'O', ş: 's', Ş: 'S', ü: 'u', Ü: 'U',
  };
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => trMap[char] ?? char)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
