import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { OrderStatus } from './types';

// ─── TAILWIND SINIF BİRLEŞTİRİCİ ────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── PARA BİRİMİ FORMATLAMA ──────────────────────────────────────────────────

export function formatPrice(amount: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPriceCompact(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k ₺`;
  }
  return `${amount.toLocaleString('tr-TR')} ₺`;
}

// ─── İNDİRİM HESAPLAMA ───────────────────────────────────────────────────────

export function calculateDiscount(price: number, salePrice: number): number {
  if (salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

// ─── TARİH FORMATLAMA ────────────────────────────────────────────────────────

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('tr-TR');
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
  return `${Math.floor(diffDays / 365)} yıl önce`;
}

// ─── SLUG ─────────────────────────────────────────────────────────────────────

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

// ─── SİPARİŞ DURUMU ──────────────────────────────────────────────────────────

export function getOrderStatusColor(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

// ─── YARDIMCI ────────────────────────────────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

export function generateOrderNumber(): string {
  const prefix = 'ORD';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export function isInStock(stock: number): boolean {
  return stock > 0;
}

export function isLowStock(stock: number, threshold = 5): boolean {
  return stock > 0 && stock <= threshold;
}

export function getReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function starRatingArray(rating: number): boolean[] {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
}

/** Telefon numarasını WhatsApp formatına çevirir */
export function toWhatsAppPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}
