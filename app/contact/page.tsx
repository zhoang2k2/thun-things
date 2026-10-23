import { Suspense } from 'react';

import { ContactForm } from '@/components/forms/ContactForm';
import { ContactProductSummary } from '@/components/forms/ContactProductSummary';
import { PageShell } from '@/components/layout/PageShell';
import { siteConfig } from '@/config/site';
import { copy } from '@/content/copy/vi';
import { type ContactPrefill, resolveContactPrefill, toFormPrefill } from '@/lib/leads/prefill';
import { getFormReadiness } from '@/lib/leads/readiness';
import { buildMetadata } from '@/lib/seo/metadata';

const page = copy.pages.contact;

export const metadata = buildMetadata({
  title: page.title,
  description: page.description,
  path: '/contact',
});

// The form is part of the prerendered shell so it works without JavaScript; only the
// query-dependent parts (product summary, purpose, sizes) stream in behind <Suspense>.
export default function ContactPage({ searchParams }: PageProps<'/contact'>) {
  const prefill = searchParams.then(resolveContactPrefill);

  return (
    <PageShell title={page.title} intro={<p>{page.body}</p>}>
      <div className="ContactSection flex flex-col gap-8">
        <Suspense fallback={null}>
          <ProductSummarySlot prefill={prefill} />
        </Suspense>
        <ContactForm
          enabled={getFormReadiness().enabled}
          prefill={prefill.then(toFormPrefill)}
          contactEmail={siteConfig.contactEmail}
        />
      </div>
    </PageShell>
  );
}

async function ProductSummarySlot({ prefill }: { prefill: Promise<ContactPrefill> }) {
  const { product } = await prefill;
  return product ? <ContactProductSummary product={product} /> : null;
}
