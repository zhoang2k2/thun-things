'use client';

import { useTranslations } from 'next-intl';

import { ErrorState } from '@/components/layout/ErrorState';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';

// The error value is never rendered: its message, digest and stack stay out of the UI.
export default function RouteError({ retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations('errors');
  return (
    <ErrorState title={t('generic.title')} body={t('generic.body')}>
      <Button size="lg" onClick={() => retry()}>
        {t('generic.retry')}
      </Button>
      <Link href="/" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
        {t('notFound.home')}
      </Link>
    </ErrorState>
  );
}
