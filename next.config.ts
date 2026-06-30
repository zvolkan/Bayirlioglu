import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'aosmith.com.tr',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BRAND: process.env.NEXT_PUBLIC_BRAND ?? 'alb-tarim',
  },
};

export default nextConfig;