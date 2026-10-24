'use client';

import { useTranslations } from 'next-intl';

import { useConsent } from '@/components/consent/ConsentProvider';

/** Footer entry point to change the cookie choice at any time. */
export const CookieSettingsButton = ({ className }: { className?: string }) => {
  const t = useTranslations('footer');
  const { openSettings } = useConsent();

  return (
    <button type="button" onClick={openSettings} className={className}>
      {t('cookieSettings')}
    </button>
  );
};
