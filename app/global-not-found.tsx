import './globals.css';

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { grotesk } from '@/components/layout/fonts';
import { NotFoundState } from '@/components/layout/NotFoundState';
import { SiteFrame } from '@/components/layout/SiteFrame';
import { routing } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo/metadata';

// Fallback for URLs that match no route and never reach proxy.ts (its matcher skips Next
// internals); proxy.ts rewrites every other miss to `/{locale}/not-found-page`. The root layout
// lives under `[locale]`, so this page brings its own document; it is Vietnamese, the default
// locale. Next adds the 404 status and noindex.
export async function generateMetadata(): Promise<Metadata> {
  const [t, site] = await Promise.all([
    getTranslations('errors.notFound'),
    getTranslations('site'),
  ]);
  const title = `${t('title')} · ${site('name')}`;
  const { openGraph, ...metadata } = buildMetadata({
    title: { absolute: title },
    description: t('description'),
    locale: routing.defaultLocale,
    path: '/',
  });
  // A missing page has no URL of its own: no canonical, no `og:url`.
  return { ...metadata, alternates: null, openGraph: { ...openGraph, url: undefined } };
}

export default function GlobalNotFound() {
  return (
    <html lang={routing.defaultLocale} className={grotesk.variable}>
      <body>
        {/* The current path exists in no locale, so the language switch offers each Home. */}
        <SiteFrame switcherPathname="/">
          <NotFoundState />
        </SiteFrame>
      </body>
    </html>
  );
}
