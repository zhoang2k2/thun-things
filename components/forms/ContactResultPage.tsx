import 'server-only';

import type { Metadata } from 'next';
import Link from 'next/link';

import { PageShell } from '@/components/layout/PageShell';
import { buttonClasses } from '@/components/ui/Button';
import { copy } from '@/content/copy/vi';
import { buildMetadata } from '@/lib/seo/metadata';

type ResultKind = 'contactSent' | 'contactRetry';

const RESULTS: Record<ResultKind, { path: string; backHref: string }> = {
  contactSent: { path: '/contact/sent', backHref: '/' },
  contactRetry: { path: '/contact/retry', backHref: '/contact' },
};

export const contactResultMetadata = (kind: ResultKind): Metadata => ({
  ...buildMetadata({
    title: copy.pages[kind].title,
    description: copy.pages[kind].description,
    path: RESULTS[kind].path,
  }),
  robots: { index: false },
});

/** Static landing page for form submissions made without JavaScript (see lib/leads/actions.ts). */
export const ContactResultPage = ({ kind }: { kind: ResultKind }) => {
  const page = copy.pages[kind];

  return (
    <PageShell title={page.title} intro={<p>{page.body}</p>}>
      <Link
        href={RESULTS[kind].backHref}
        className={buttonClasses({ variant: 'secondary', size: 'lg' })}
      >
        {page.back}
      </Link>
    </PageShell>
  );
};
