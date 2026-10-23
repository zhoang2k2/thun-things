import type { NextConfig } from 'next';

import { securityHeaders } from './lib/security/csp';

const nextConfig: NextConfig = {
  async headers() {
    // Platform markers (not owner variables), read here because the config runs before app code.
    const headers = securityHeaders({
      dev: process.env.NODE_ENV === 'development',
      preview: process.env.VERCEL_ENV === 'preview',
    });
    return [{ source: '/:path*', headers }];
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: { formats: ['image/avif', 'image/webp'] },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
