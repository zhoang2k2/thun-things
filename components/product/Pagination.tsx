import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';

interface PaginationProps {
  page: number;
  pageCount: number;
}

const pageHref = (page: number) => (page === 1 ? '/' : `/?page=${page}`);

const ITEM_CLASSES =
  'Pagination__link focus-visible:outline-ink inline-flex h-10 min-w-10 items-center justify-center px-3 text-sm tracking-wide uppercase focus-visible:outline-2 focus-visible:outline-offset-2';

// V-09: numbered pages with text previous/next links; page 1 lives at `/`.
export const Pagination = ({ page, pageCount }: PaginationProps) => {
  const t = useTranslations('pagination');
  if (pageCount < 2) return null;

  const pages = Array.from({ length: pageCount }, (_, position) => position + 1);

  return (
    <nav aria-label={t('label')} className="Pagination flex justify-center px-4 py-12">
      <ul className="Pagination__list flex items-center gap-2">
        {page > 1 && (
          <li>
            <Link href={pageHref(page - 1)} className={cn(ITEM_CLASSES, 'hover:underline')}>
              {t('previous')}
            </Link>
          </li>
        )}
        {pages.map((target) => {
          const current = target === page;
          return (
            <li key={target}>
              <Link
                href={pageHref(target)}
                aria-label={`${t('page')} ${target}`}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  ITEM_CLASSES,
                  current ? 'bg-ink text-canvas' : 'border-line hover:border-ink border',
                )}
              >
                {target}
              </Link>
            </li>
          );
        })}
        {page < pageCount && (
          <li>
            <Link href={pageHref(page + 1)} className={cn(ITEM_CLASSES, 'hover:underline')}>
              {t('next')}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};
