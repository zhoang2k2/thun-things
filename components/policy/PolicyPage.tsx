import 'server-only';

import type { Metadata } from 'next';

import { PageShell } from '@/components/layout/PageShell';
import { copy } from '@/content/copy/vi';
import { buildMetadata } from '@/lib/seo/metadata';
import type { PolicySlug } from '@/lib/seo/routes';

export const policyMetadata = (slug: PolicySlug): Metadata => {
  const page = copy.pages[slug];
  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/policy/${slug}`,
  });
};

export const PolicyPage = ({ slug }: { slug: PolicySlug }) => {
  const page = copy.pages[slug];

  return <PageShell title={page.title} intro={<p>{page.body}</p>} />;
};
