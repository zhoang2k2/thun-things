import { PageShell } from '@/components/layout/PageShell';
import { copy } from '@/content/copy/vi';
import { buildMetadata } from '@/lib/seo/metadata';

const page = copy.pages.about;

export const metadata = buildMetadata({
  title: page.title,
  description: page.description,
  path: '/about',
});

export default function AboutPage() {
  return (
    <PageShell title={page.title}>
      <p>{page.body}</p>
    </PageShell>
  );
}
