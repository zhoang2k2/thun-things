import 'server-only';

import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageShell } from '@/components/layout/PageShell';
import { buttonClasses } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { buildMetadata } from '@/lib/seo/metadata';

type ResultKind = 'contactSent' | 'contactRetry';

const RESULTS: Record<ResultKind, { path: string; backHref: string }> = {
  contactSent: { path: '/contact/sent', backHref: '/' },
  contactRetry: { path: '/contact/retry', backHref: '/contact' },
};

export const contactResultMetadata = async (kind: ResultKind): Promise<Metadata> => {
  const [t, locale] = await Promise.all([getTranslations(`pages.${kind}`), getLocale()]);
  return {
    ...buildMetadata({
      title: t('title'),
      description: t('description'),
      locale,
      path: RESULTS[kind].path,
    }),
    robots: { index: false },
  };
};

/** Static landing page for form submissions made without JavaScript (see lib/leads/actions.ts). */
export const ContactResultPage = ({ kind }: { kind: ResultKind }) => {
  const t = useTranslations(`pages.${kind}`);

  return (
    <PageShell title={t('title')} intro={<p>{t('body')}</p>}>
      <Link
        href={RESULTS[kind].backHref}
        className={buttonClasses({ variant: 'secondary', size: 'lg' })}
      >
        {t('back')}
      </Link>
    </PageShell>
  );
};
