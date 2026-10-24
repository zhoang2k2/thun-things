import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { NotFoundState } from '@/components/layout/NotFoundState';
import { buildMetadata } from '@/lib/seo/metadata';

// proxy.ts rewrites every unknown URL here, using the locale of the first path segment
// (Vietnamese when it is not a locale), so a miss gets that locale's layout, copy and `lang`.
export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('errors.notFound')]);
  const { openGraph, ...metadata } = buildMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    path: '/',
  });
  // A missing page has no URL of its own: no canonical, no alternates, no `og:url`. Next adds
  // noindex because the response is a 404.
  return { ...metadata, alternates: null, openGraph: { ...openGraph, url: undefined } };
}

// A notFound() thrown by the page itself would bubble past the root layout, and Next would
// prerender an empty error shell that only renders in the browser. Thrown inside a Suspense
// boundary, it only sets the prerendered response status to 404 and leaves the server-rendered
// 404 body around it in the static HTML.
const NotFoundStatus = () => notFound();

export default function MissingPage() {
  return (
    <>
      <NotFoundState />
      <Suspense>
        <NotFoundStatus />
      </Suspense>
    </>
  );
}
