import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // `/admin` de listeye eklendi. Sayfalar zaten `noindex` meta etiketi
      // taşıyor, ama tarama bütçesi ve tutarlılık için burada da olmalı.
      disallow: ['/admin/', '/hesabim/', '/sepet/', '/odeme/', '/api/'],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  }
}
