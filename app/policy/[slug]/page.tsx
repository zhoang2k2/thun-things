import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageShell } from '@/components/layout/PageShell';
import { copy } from '@/content/copy/vi';
import { buildMetadata } from '@/lib/seo/metadata';
import { isPolicySlug, policySlugs } from '@/lib/seo/routes';

// dynamicParams is unavailable with Cache Components, so unknown slugs 404 via notFound().
export const generateStaticParams = () => policySlugs.map((slug) => ({ slug }));

export async function generateMetadata({ params }: PageProps<'/policy/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  if (!isPolicySlug(slug)) return {};
  const page = copy.pages[slug];
  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/policy/${slug}`,
  });
}

export default async function PolicyPage({ params }: PageProps<'/policy/[slug]'>) {
  const { slug } = await params;
  if (!isPolicySlug(slug)) notFound();
  const page = copy.pages[slug];

  return (
    <PageShell title={page.title}>
      <p>{page.body}</p>
    </PageShell>
  );
}
