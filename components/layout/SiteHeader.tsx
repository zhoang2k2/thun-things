import { useTranslations } from 'next-intl';

import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import type { NavItem } from '@/config/site';
import { Link } from '@/i18n/navigation';

interface SiteHeaderProps {
  nav: NavItem[];
  /** Passed to the language switch on pages whose path exists in no locale (404). */
  switcherPathname?: string;
}

const LINK_CLASSES =
  'focus-visible:outline-ink inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2';

export const SiteHeader = ({ nav, switcherPathname }: SiteHeaderProps) => {
  const t = useTranslations();
  return (
    <header className="SiteHeader bg-canvas border-line sticky top-0 z-40 h-(--header-height) border-b">
      <div className="SiteHeader__inner mx-auto flex h-full max-w-screen-2xl items-center justify-between gap-4 px-4 md:px-8">
        <Link
          href="/"
          className={`SiteHeader__logo text-lg font-bold tracking-tight ${LINK_CLASSES}`}
        >
          {t('site.name')}
        </Link>
        <div className="SiteHeader__end flex items-center gap-4 text-sm tracking-wide uppercase md:gap-6">
          <nav aria-label={t('nav.label')} className="SiteHeader__nav">
            <ul className="SiteHeader__list flex items-center gap-4 md:gap-6">
              {nav.map((item) => (
                <li key={item.href} className="SiteHeader__item">
                  <Link href={item.href} className={`SiteHeader__link ${LINK_CLASSES}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LocaleSwitcher pathname={switcherPathname} />
        </div>
      </div>
    </header>
  );
};
