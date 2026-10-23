import Link from 'next/link';

import type { NavItem } from '@/config/site';
import { copy } from '@/content/copy/vi';

interface SiteHeaderProps {
  nav: NavItem[];
}

const LINK_CLASSES =
  'focus-visible:outline-ink inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2';

export const SiteHeader = ({ nav }: SiteHeaderProps) => (
  <header className="SiteHeader bg-canvas border-line sticky top-0 z-40 h-(--header-height) border-b">
    <div className="SiteHeader__inner mx-auto flex h-full max-w-screen-2xl items-center justify-between px-4 md:px-8">
      <Link
        href="/"
        className={`SiteHeader__logo text-lg font-bold tracking-tight ${LINK_CLASSES}`}
      >
        {copy.site.name}
      </Link>
      <nav aria-label={copy.nav.label} className="SiteHeader__nav">
        <ul className="SiteHeader__list flex items-center gap-6 text-sm tracking-wide uppercase">
          {nav.map((item) => (
            <li key={item.href} className="SiteHeader__item">
              <Link href={item.href} className={`SiteHeader__link ${LINK_CLASSES}`}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </header>
);
