import { useTranslations } from 'next-intl';

export const SkipLink = () => {
  const t = useTranslations('a11y');
  return (
    <a
      href="#main"
      className="SkipLink bg-ink text-canvas focus-visible:outline-accent sr-only z-50 px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus-visible:outline-2"
    >
      {t('skipToContent')}
    </a>
  );
};
