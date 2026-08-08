import type { IconName } from '@/components/ui/Icon'

/**
 * Kategori ikonları — TEK KAYNAK.
 *
 * Kategorilerin ikonu veritabanında (`categories.icon`) emoji olarak
 * duruyordu: 🌿, 💧, 🧪, 🪨, ❄️, 🔌 … Site genelindeki emoji temizliği bunları
 * yakalayamadı, çünkü koddan değil veriden geliyorlar.
 *
 * Emojiyi veritabanından silmek yerine burada eşliyoruz. İki sebeple:
 *
 * 1. Veritabanına dokunmak gerekmiyor; SQL çalıştırmadan düzeliyor.
 * 2. Kategori yönetim ekranı henüz yok. Olduğunda yönetici ikon adını
 *    (`damla`, `filiz` …) doğrudan yazabilecek — `iconAdiGecerli` kontrolü
 *    veritabanındaki değer geçerli bir ikon adıysa onu kullanıyor.
 *
 * Listede olmayan bir kategori için `paket` ikonu düşüyor, yani yeni kategori
 * eklendiğinde boşluk görünmüyor.
 */

const ESLEME: Record<string, IconName> = {
  // ── ALB Tarım ──────────────────────────────────────────────────────────
  'alb-tarim-urunleri': 'filiz',
  'ithal-urunler': 'dunya',
  'toptanci-olunanlar': 'magaza',
  'bayilik-olunanlar': 'magaza',

  gubreler: 'filiz',
  'taban-gubresi': 'toprak',
  toprak: 'toprak',
  'damla-sulama-gubreleri': 'damla',
  'yaprak-gubreleri': 'filiz',
  'mikro-elementler': 'analiz',
  'sivi-gubreler-amino': 'molekul',
  'deniz-yosunu-organik': 'filiz',
  'diger-ithal-urunler': 'paket',
  sulama: 'damla',
  ilac: 'analiz',

  // Tedarikçi markaları — adları zaten ayırt edici, ortak bir rozet yeterli
  'timac-agro': 'fabrika',
  bazachem: 'kalite',
  'haifa-cal': 'kalite',
  stoller: 'kalite',
  'atlantica-agricola': 'kalite',
  unittar: 'kalite',
  'lances-link': 'zincir',
  lebosol: 'molekul',
  tamagro: 'kalite',

  // ── Alb Su Teknolojileri ───────────────────────────────────────────────
  ev: 'ev',
  'is-yeri': 'bina',
  'kucuk-ev-aletleri': 'fis',
  'yedek-parca': 'servis',

  'ev-su-aritma': 'damla',
  'ev-su-yumusatma': 'damla',
  'is-yeri-yumusatma': 'damla',
  'ev-su-isitici': 'alev',
  'ticari-boiler': 'alev',
  'su-sebili': 'dus',
  endustriyel: 'fabrika',
  filtre: 'civata',
  klima: 'iklim',
  vantilator: 'fan',
  temizlik: 'temizlik',
}

/**
 * Kategori için ikon adı döndürür.
 *
 * @param slug  Kategori adresi (örn. "damla-sulama-gubreleri")
 * @param dbIcon  Veritabanındaki `icon` değeri; ileride ikon adı tutarsa kullanılır
 */
export function categoryIcon(
  slug: string | null | undefined,
  dbIcon?: string | null,
): IconName {
  if (slug && ESLEME[slug]) return ESLEME[slug]
  // Veritabanına ikon adı yazılmışsa (emoji değil) ona güven
  if (dbIcon && /^[a-z][a-z-]{2,}$/.test(dbIcon)) return dbIcon as IconName
  return 'paket'
}
