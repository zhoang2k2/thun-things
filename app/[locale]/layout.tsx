import '../globals.css';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locale as rootLocale } from 'next/root-params';
import { getLocale, getTranslations } from 'next-intl/server';

import { grotesk } from '@/components/layout/fonts';
import { SiteFrame } from '@/components/layout/SiteFrame';
import { isLocale, routing } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo/metadata';

// Both locales are prerendered; proxy.ts turns any other first segment into a 404 before it
// gets here.
export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }));

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations('site'), getLocale()]);
  return {
    ...buildMetadata({ description: t('description'), locale, path: '/' }),
    title: { default: t('name'), template: `%s · ${t('name')}` },
  };
}

export default async function LocaleLayout({ children }: LayoutProps<'/[locale]'>) {
  const locale = await rootLocale();
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={grotesk.variable}>
      <body>
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
