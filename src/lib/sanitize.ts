import sanitizeHtml from 'sanitize-html'

/**
 * Blog içeriği temizliği.
 *
 * Blog yazısının gövdesi `dangerouslySetInnerHTML` ile basılıyor ve form
 * kullanıcıya "istersen HTML de yazabilirsiniz" diyor. İçerik hiçbir yerde
 * filtrelenmiyordu: yazının içine konan bir `<script>` veya `<img onerror=...>`
 * siteyi ziyaret eden HERKESTE çalışırdı. İçeriği yalnızca yönetici girdiği
 * için "herkes yazabilir" durumu yok, ama iki gerçekçi yol var — admin
 * oturumunun ele geçirilmesi ve yöneticinin dışarıdan kopyaladığı HTML'i
 * farkında olmadan yapıştırması. Çalışan script `/hesabim` ve `/odeme` ile
 * aynı origin'de olduğu için oturum çerezlerine erişirdi.
 *
 * Temizlik hem YAZMA (veritabanına girmeden) hem OKUMA anında yapılıyor.
 * Okuma tarafı, bu düzeltmeden ÖNCE kaydedilmiş yazılar için gerekli.
 */

const AYARLAR: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr',
    'h2', 'h3', 'h4',
    'strong', 'b', 'em', 'i', 'u', 's',
    'ul', 'ol', 'li',
    'blockquote', 'figure', 'figcaption',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div',
  ],
  allowedAttributes: {
    // target/rel de listede olmalı: transformTags bunları eklese bile
    // allowedAttributes filtresi listede olmayanı siliyor.
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    // `class` yalnızca bu ikisinde: yazı içi biçimlendirme için yeterli,
    // `style` ise hiç kabul edilmiyor (CSS üzerinden tıklama hırsızlığı olur).
    span: ['class'],
    div: ['class'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
  },
  // Yalnızca güvenli şemalar. `javascript:`, `data:` ve `vbscript:` dışarıda.
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
  // İçeriği tamamen atılacak etiketler — metinleri de gitsin
  nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript', 'iframe'],
  transformTags: {
    // Dış bağlantılar yeni sekmede ve referrer sızdırmadan açılsın
    a: (tagName, attribs) => {
      const href = attribs.href ?? ''
      const disLink = /^https?:\/\//i.test(href)
      return {
        tagName,
        attribs: disLink
          ? { ...attribs, target: '_blank', rel: 'noopener noreferrer nofollow' }
          : attribs,
      }
    },
  },
}

/** Blog gövdesini güvenli HTML'e indirger. */
export function sanitizeBlogHtml(html: string): string {
  if (!html) return ''
  return sanitizeHtml(html, AYARLAR)
}

/**
 * `<script>` içine gömülecek JSON'u kaçırır.
 *
 * `JSON.stringify` eğik çizgiyi kaçırmaz; ürün adına `</script><script>...`
 * yazan biri tarayıcıya script bloğunu erken kapattırıp gerisini
 * çalıştırabilirdi. Satır ayırıcı karakterler de (U+2028/U+2029) JavaScript
 * ayrıştırıcısını bozduğu için kaçırılıyor.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
