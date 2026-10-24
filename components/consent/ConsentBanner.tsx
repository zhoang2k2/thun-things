'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { useConsent } from '@/components/consent/ConsentProvider';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';

const LINK =
  'focus-visible:outline-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2';

// P6-1: bottom bar shown after hydration only when no decision exists. It overlays the page
// (no layout shift) and never takes focus; its height is exposed as --consent-bar-height so the
// page can pad its bottom and the mobile order bar can sit below it.
export const ConsentBanner = () => {
  const t = useTranslations('consent');
  const { ready, decided, accept, reject, openSettings } = useConsent();
  const ref = useRef<HTMLElement>(null);
  const visible = ready && !decided;

  useEffect(() => {
    const element = ref.current;
    const root = document.documentElement;
    if (!visible || !element) return;
    const update = () =>
      root.style.setProperty('--consent-bar-height', `${element.offsetHeight}px`);
    update();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
    observer?.observe(element);
    return () => {
      observer?.disconnect();
      root.style.removeProperty('--consent-bar-height');
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <section
      ref={ref}
      aria-label={t('label')}
      className="ConsentBanner bg-canvas border-ink fixed inset-x-0 bottom-0 z-50 border-t"
    >
      <div className="ConsentBanner__inner mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="ConsentBanner__message max-w-prose text-sm leading-6">
          {t('message')}{' '}
          <Link href="/policy/privacy" className={LINK}>
            {t('policyLink')}
          </Link>
        </p>
        <div className="ConsentBanner__actions flex shrink-0 flex-wrap gap-2">
          <Button size="md" onClick={accept}>
            {t('accept')}
          </Button>
          <Button size="md" variant="secondary" onClick={reject}>
            {t('reject')}
          </Button>
          <Button size="md" variant="ghost" onClick={openSettings}>
            {t('customize')}
          </Button>
        </div>
      </div>
    </section>
  );
};
