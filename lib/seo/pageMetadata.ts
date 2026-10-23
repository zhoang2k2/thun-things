import 'server-only';

import type { Metadata } from 'next';

import { copy } from '@/content/copy/vi';
import { listProducts } from '@/lib/catalog';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Home metadata for the `page` search param. The page is clamped by the catalog, so
 * `?page=99` canonicalises to the last real page and invalid values to `/`.
 */
export const homeMetadata = (pageParam: string | string[] | undefined): Metadata => {
  const { page } = listProducts(pageParam);
  const { description } = copy.pages.home;
  if (page === 1) return buildMetadata({ description, path: '/' });

  const label = `${copy.pagination.page} ${page}`;
  return buildMetadata({
    title: { absolute: `${label} · ${copy.site.name}` },
    description: `${description} ${label}.`,
    path: `/?page=${page}`,
  });
};
