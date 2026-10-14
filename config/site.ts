/**
 * Application site configuration constants
 */

import type { Locale } from '@/types';

export const siteConfig = {
  name: 'Thun Things',
  description: 'Minimalist, expressive fashion brand website.',
  defaultLocale: 'vi' as Locale,
  locales: ['vi', 'en'] as const,
} as const;
