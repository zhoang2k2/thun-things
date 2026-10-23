'use client';

import { useSearchParams, useSelectedLayoutSegment } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Suspense } from 'react';

import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

interface LocaleSwitcherProps {
  /**
   * Fixed target path (without locale) instead of the current one, for pages whose path exists
   * in no locale, such as the 404 page.
   */
  pathname?: string;
}

const NOT_FOUND_SEGMENT = 'not-found-page';

const LINK_CLASSES =
  'LocaleSwitcher__link focus-visible:outline-ink inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 aria-[current=true]:underline';

const LocaleLinks = ({ href }: { href: string }) => {
  const t = useTranslations('localeSwitcher');
  const current = useLocale();

  return (
    <ul className="LocaleSwitcher__list flex items-center gap-4">
      {routing.locales.map((locale) => (
        <li key={locale} className="LocaleSwitcher__item">
          <Link
            href={href}
            locale={locale}
            lang={locale}
            hrefLang={locale}
            aria-current={locale === current ? 'true' : undefined}
            className={LINK_CLASSES}
          >
            <span aria-hidden="true">{locale.toUpperCase()}</span>
            <span className="sr-only">{t(locale)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

// The query is request data: prerendered pages render the path-only links (which also work
// without JavaScript, dropping the query: accepted exception, spec section 3 and ADR-008), and
// the browser fills in the query.
const CurrentPathLinks = () => {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  return <LocaleLinks href={query ? `${pathname}?${query}` : pathname} />;
};

const PathOnlyLinks = () => <LocaleLinks href={usePathname()} />;

/** VI / EN text links to the same path and query in each locale (spec section 3). */
export const LocaleSwitcher = ({ pathname }: LocaleSwitcherProps) => {
  const t = useTranslations('localeSwitcher');
  // proxy.ts rewrites unknown URLs to `/{locale}/not-found-page`; the requested path exists in no
  // locale, so each link goes to that locale's Home.
  const fixedPath = useSelectedLayoutSegment() === NOT_FOUND_SEGMENT ? '/' : pathname;
  return (
    <nav aria-label={t('label')} className="LocaleSwitcher">
      {fixedPath ? (
        <LocaleLinks href={fixedPath} />
      ) : (
        <Suspense fallback={<PathOnlyLinks />}>
          <CurrentPathLinks />
        </Suspense>
      )}
    </nav>
  );
};
