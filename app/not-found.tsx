import type { Metadata } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { ErrorState } from '@/components/layout/ErrorState';
import { buttonClasses } from '@/components/ui/Button';

// Next adds noindex and the 404 status itself; only the title and description are set here.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('errors.notFound');
  return { title: t('title'), description: t('description') };
}

export default function NotFound() {
  const t = useTranslations('errors.notFound');
  return (
    <ErrorState title={t('title')} body={t('body')}>
      <Link href="/" className={buttonClasses({ size: 'lg' })}>
        {t('home')}
      </Link>
      <Link href="/contact" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
        {t('contact')}
      </Link>
    </ErrorState>
  );
}
