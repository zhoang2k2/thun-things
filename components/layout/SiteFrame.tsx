import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { siteConfig } from '@/config/site';
import { pickClientMessages } from '@/i18n/clientMessages';

interface SiteFrameProps {
  children: ReactNode;
  /** See `SiteHeader`: a fixed language-switch target for the 404 page. */
  switcherPathname?: string;
}

/** Skip link, header, main landmark and footer: the body of every page, including the 404. */
export const SiteFrame = async ({ children, switcherPathname }: SiteFrameProps) => {
  const [messages, t] = await Promise.all([getMessages(), getTranslations()]);

  return (
    // Only the namespaces Client Components translate reach the browser; forms add their own.
    <NextIntlClientProvider messages={pickClientMessages(messages)}>
      <SkipLink />
      <SiteHeader
        nav={siteConfig.nav.map(({ href, labelKey }) => ({ href, label: t(labelKey) }))}
        switcherPathname={switcherPathname}
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
  );
};
