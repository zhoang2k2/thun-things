import 'server-only';

import type { Metadata } from 'next';
import { useFormatter, useTranslations } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageShell } from '@/components/layout/PageShell';
import { privacyPolicy } from '@/content/policies/privacy';
import { returnsPolicy } from '@/content/policies/returns';
import type { PolicyDocument } from '@/content/policies/types';
import { buildMetadata } from '@/lib/seo/metadata';
import type { PolicySlug } from '@/lib/seo/routes';

const DOCUMENTS: Record<PolicySlug, PolicyDocument> = {
  privacy: privacyPolicy,
  returns: returnsPolicy,
};

export const policyMetadata = async (slug: PolicySlug): Promise<Metadata> => {
  const [t, locale] = await Promise.all([getTranslations(`pages.${slug}`), getLocale()]);
  return buildMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    path: `/policy/${slug}`,
  });
};

export const PolicyPage = ({ slug }: { slug: PolicySlug }) => {
  const t = useTranslations();
  const format = useFormatter();
  const { updatedAt, sections } = DOCUMENTS[slug];
  // `updatedAt` is a calendar date, so format it in UTC to keep the day unchanged.
  const date = format.dateTime(new Date(updatedAt), { dateStyle: 'long', timeZone: 'UTC' });
  const updated = t('policy.updated', { date });

  return (
    <PageShell
      title={t(`pages.${slug}.title`)}
      intro={
        <>
          <p>{t(`pages.${slug}.description`)}</p>
          <p className="mt-2 text-sm">
            <time dateTime={updatedAt}>{updated}</time> · {t('policy.draft')}
          </p>
        </>
      }
    >
      <article className="PolicyPage flex max-w-prose flex-col gap-12">
        {sections.map((section) => (
          <section key={section.heading} className="PolicyPage__section flex flex-col gap-4">
            <h2 className="PolicyPage__heading text-xl leading-7 font-bold">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="leading-7">
                {paragraph}
              </p>
            ))}
            {section.items && (
              <ul className="PolicyPage__list flex list-disc flex-col gap-2 pl-6 leading-7">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </PageShell>
  );
};
