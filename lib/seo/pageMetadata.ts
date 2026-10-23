import 'server-only';

import type { Metadata } from 'next';

import { getMessagesFor } from '@/i18n/messages';
import type { Locale } from '@/i18n/routing';
import { listProducts } from '@/lib/catalog';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Home metadata for the `page` search param. The page is clamped by the catalog, so
 * `?page=99` canonicalises to the last real page and invalid values to `/`.
 */
export const homeMetadata = (
  pageParam: string | string[] | undefined,
  locale: Locale,
): Metadata => {
  const { page } = listProducts(pageParam);
  const { pages, pagination, site } = getMessagesFor(locale);
  const { description } = pages.home;
  if (page === 1) return buildMetadata({ description, locale, path: '/' });

  const label = `${pagination.page} ${page}`;
  return buildMetadata({
    title: { absolute: `${label} · ${site.name}` },
    description: `${description} ${label}.`,
    locale,
    path: `/?page=${page}`,
  });
};
