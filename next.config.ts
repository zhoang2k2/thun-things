import type { NextConfig } from 'next';

import { securityHeaders } from './lib/security/csp';

// Next 16.4.2 default (node_modules/next/dist/shared/lib/router/utils/html-bots.js) plus Zalo
// (main sharing channel) and plain Googlebot, so their metadata stays inside <head>.
const HTML_LIMITED_BOTS =
  /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|Zalo|Googlebot/i;

const nextConfig: NextConfig = {
  htmlLimitedBots: HTML_LIMITED_BOTS,
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
