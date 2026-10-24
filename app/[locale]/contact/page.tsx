import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { ContactForm } from '@/components/forms/ContactForm';
import { ContactProductSummary } from '@/components/forms/ContactProductSummary';
import { FormIntlProvider } from '@/components/forms/FormIntlProvider';
import { PageShell } from '@/components/layout/PageShell';
import { siteConfig } from '@/config/site';
import { type ContactPrefill, resolveContactPrefill, toFormPrefill } from '@/lib/leads/prefill';
import { getFormReadiness } from '@/lib/leads/readiness';
import { buildMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations('pages.contact'), getLocale()]);
  return buildMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    path: '/contact',
  });
}

// The form is part of the prerendered shell so it works without JavaScript; only the
// query-dependent parts (product summary, purpose, sizes) stream in behind <Suspense>.
export default function ContactPage({ searchParams }: PageProps<'/[locale]/contact'>) {
  const t = useTranslations('pages.contact');
  const prefill = searchParams.then(resolveContactPrefill);

  return (
    <PageShell title={t('title')} intro={<p>{t('body')}</p>}>
      <div className="ContactSection flex flex-col gap-8">
        <Suspense fallback={null}>
          <ProductSummarySlot prefill={prefill} />
        </Suspense>
        <FormIntlProvider>
          <ContactForm
            enabled={getFormReadiness().enabled}
            prefill={prefill.then(toFormPrefill)}
            contactEmail={siteConfig.contactEmail}
          />
        </FormIntlProvider>
      </div>
    </PageShell>
  );
}

async function ProductSummarySlot({ prefill }: { prefill: Promise<ContactPrefill> }) {
  const { product } = await prefill;
  return product ? <ContactProductSummary product={product} /> : null;
}
