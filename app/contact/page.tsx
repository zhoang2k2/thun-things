import { Suspense } from 'react';

import { ContactForm } from '@/components/forms/ContactForm';
import { ContactProductSummary } from '@/components/forms/ContactProductSummary';
import { PageShell } from '@/components/layout/PageShell';
import { siteConfig } from '@/config/site';
import { copy } from '@/content/copy/vi';
import { resolveContactPrefill } from '@/lib/leads/prefill';
import { getFormReadiness } from '@/lib/leads/readiness';
import { buildMetadata } from '@/lib/seo/metadata';

const page = copy.pages.contact;

export const metadata = buildMetadata({
  title: page.title,
  description: page.description,
  path: '/contact',
});

export default function ContactPage({ searchParams }: PageProps<'/contact'>) {
  return (
    <PageShell title={page.title} intro={<p>{page.body}</p>}>
      <Suspense fallback={<ContactFormSkeleton />}>
        <ContactSection searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}

// Reads the query (request-time) inside Suspense so the page shell stays prerendered.
async function ContactSection({ searchParams }: Pick<PageProps<'/contact'>, 'searchParams'>) {
  const { product, purpose } = resolveContactPrefill(await searchParams);

  return (
    <div className="ContactSection flex flex-col gap-8">
      {product && <ContactProductSummary product={product} />}
      <ContactForm
        enabled={getFormReadiness().enabled}
        defaultPurpose={purpose}
        productSlug={product?.slug}
        sizes={product?.sizes}
        contactEmail={siteConfig.contactEmail}
      />
    </div>
  );
}

const ContactFormSkeleton = () => (
  <div aria-hidden="true" className="ContactFormSkeleton flex max-w-3xl flex-col gap-8">
    <div className="bg-placeholder h-12 w-2/3" />
    <div className="grid gap-8 md:grid-cols-2">
      <div className="bg-placeholder h-20" />
      <div className="bg-placeholder h-20" />
    </div>
    <div className="bg-placeholder h-20" />
    <div className="bg-placeholder h-40" />
  </div>
);
