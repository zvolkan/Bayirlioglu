import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  // NOT: `serverExternalPackages: ['iyzipay']` kaldırıldı. iyzipay paketi
  // Workers'ta çalışamadığı için (kurulumunda fs.readdirSync + hesaplanan
  // yollu require var) kaldırıldı; iyzico artık src/lib/iyzico.ts içinde
  // doğrudan fetch ile çağrılıyor.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aosmith.com.tr',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BRAND: process.env.NEXT_PUBLIC_BRAND ?? 'alb-tarim',
  },

  /**
   * Güvenlik başlıkları.
   * Ödeme sayfası barındıran bir sitede clickjacking, MIME-sniffing ve
   * referer sızıntısı korumaları temel gerekliliktir.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Hesap ve ödeme sayfaları önbelleğe alınmasın
        source: '/(hesabim|sepet|odeme|admin)/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ]
  },
};

export default nextConfig;
