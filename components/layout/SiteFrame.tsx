import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { Analytics } from '@/components/consent/Analytics';
import { ConsentBanner } from '@/components/consent/ConsentBanner';
import { ConsentBootScript } from '@/components/consent/ConsentBootScript';
import { ConsentProvider } from '@/components/consent/ConsentProvider';
import { ConsentSettings } from '@/components/consent/ConsentSettings';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { QuizBubble } from '@/components/quiz/QuizBubble';
import { QuizLauncher } from '@/components/quiz/QuizLauncher';
import { QuizProvider } from '@/components/quiz/QuizProvider';
import { siteConfig } from '@/config/site';
import { pickClientMessages } from '@/i18n/clientMessages';
import { getQuizOptions } from '@/lib/catalog';
import { env } from '@/lib/env';

interface SiteFrameProps {
  children: ReactNode;
  /** See `SiteHeader`: a fixed language-switch target for the 404 page. */
  switcherPathname?: string;
}

/** Skip link, header, main landmark and footer: the body of every page, including the 404. */
export const SiteFrame = async ({ children, switcherPathname }: SiteFrameProps) => {
  const [messages, t, locale] = await Promise.all([getMessages(), getTranslations(), getLocale()]);
  const quiz = getQuizOptions();
  const quizOptions = {
    colors: quiz.colors.map(({ id, label, hex }) => ({ id, label: label[locale], hex })),
    vibes: quiz.vibes,
  };

  return (
    // Only the namespaces Client Components translate reach the browser; forms add their own.
    <NextIntlClientProvider messages={pickClientMessages(messages)}>
      <ConsentProvider>
        <QuizProvider options={quizOptions}>
          <ConsentBootScript />
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
          <ConsentBanner />
          <QuizBubble />
          <QuizLauncher />
        </QuizProvider>
        <ConsentSettings />
        {/* VERCEL_ENV is a platform marker read at build (P6-3), not an owner variable. */}
        <Analytics gaId={env.NEXT_PUBLIC_GA_ID} vercelEnv={process.env.VERCEL_ENV} />
      </ConsentProvider>
    </NextIntlClientProvider>
  );
};
