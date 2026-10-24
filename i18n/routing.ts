import { hasLocale } from 'next-intl';
import { defineRouting } from 'next-intl/routing';

/**
 * Every page lives under `/{locale}` (P5-1: `/` always goes to `/vi`, no browser-language
 * detection). The locale cookie and the `Link` response header are off: nothing reads the
 * cookie, and hreflang alternates come from page metadata.
 */
export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'always',
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && hasLocale(routing.locales, value);

/**
 * Prefixes an app path (`/`, `/about`, `/?page=2`, `/contact?product=x`) with the locale, for
 * code outside React. Components use the `Link` from `@/i18n/navigation` instead.
 */
export const localizedPath = (locale: Locale, path: string): string => {
  if (path === '/') return `/${locale}`;
  if (path.startsWith('/?')) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
};
