import './globals.css';

import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { siteConfig } from '@/config/site';
import { pickClientMessages } from '@/i18n/clientMessages';
import { buildMetadata } from '@/lib/seo/metadata';

const grotesk = Bricolage_Grotesque({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-grotesk',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('site');
  return {
    ...buildMetadata({ description: t('description'), path: '/' }),
    title: { default: t('name'), template: `%s · ${t('name')}` },
  };
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const [messages, t] = await Promise.all([getMessages(), getTranslations()]);

  return (
    <html lang="vi" className={grotesk.variable}>
      <body>
        {/* Only the namespaces Client Components translate reach the browser. */}
        <NextIntlClientProvider messages={pickClientMessages(messages)}>
          <SkipLink />
          <SiteHeader
            nav={siteConfig.nav.map(({ href, labelKey }) => ({ href, label: t(labelKey) }))}
          />
          <main id="main" tabIndex={-1} className="Main focus:outline-none">
            {children}
          </main>
          <SiteFooter
            policies={siteConfig.policies.map(({ href, labelKey }) => ({
              href,
              label: t(labelKey),
            }))}
            contactEmail={siteConfig.contactEmail}
            socials={siteConfig.socials}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
