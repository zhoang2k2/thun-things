'use client';

import './globals.css';

import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { Suspense, use } from 'react';

import { ErrorState } from '@/components/layout/ErrorState';
import { Button } from '@/components/ui/Button';

// This boundary replaces the root layout (and its message provider) and ships with every page,
// so its copy is imported lazily: a static JSON import would put the whole bundle in the
// shared client chunk. The import only runs once the boundary renders.
type GlobalErrorMessages = { errors: { generic: Messages['errors']['generic'] } };
type Messages = typeof import('@/messages/vi.json');

let messagesPromise: Promise<GlobalErrorMessages> | undefined;
const loadMessages = () =>
  (messagesPromise ??= import('@/messages/vi.json').then(({ errors }) => ({
    errors: { generic: errors.generic },
  })));

const GlobalErrorContent = ({ retry }: { retry: () => void }) => {
  const t = useTranslations('errors.generic');
  return (
    <>
      <title>{t('title')}</title>
      <ErrorState title={t('title')} body={t('body')}>
        <Button size="lg" onClick={() => retry()}>
          {t('retry')}
        </Button>
      </ErrorState>
    </>
  );
};

const LocalizedGlobalError = ({ retry }: { retry: () => void }) => (
  <NextIntlClientProvider locale="vi" timeZone="Asia/Ho_Chi_Minh" messages={use(loadMessages())}>
    <GlobalErrorContent retry={retry} />
  </NextIntlClientProvider>
);

// Stays minimal: no header, footer or router links.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="vi">
      <body>
        <Suspense fallback={null}>
          <LocalizedGlobalError retry={retry} />
        </Suspense>
      </body>
    </html>
  );
}
