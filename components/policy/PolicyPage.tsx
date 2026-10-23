import 'server-only';

import type { Metadata } from 'next';

import { PageShell } from '@/components/layout/PageShell';
import { copy } from '@/content/copy/vi';
import { privacyPolicy } from '@/content/policies/privacy';
import { returnsPolicy } from '@/content/policies/returns';
import type { PolicyDocument } from '@/content/policies/types';
import { buildMetadata } from '@/lib/seo/metadata';
import type { PolicySlug } from '@/lib/seo/routes';

const DOCUMENTS: Record<PolicySlug, PolicyDocument> = {
  privacy: privacyPolicy,
  returns: returnsPolicy,
};

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeZone: 'UTC' });

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
  const { updatedAt, sections } = DOCUMENTS[slug];
  const updated = `${copy.policy.updated} ${dateFormatter.format(new Date(updatedAt))}`;

  return (
    <PageShell
      title={page.title}
      intro={
        <>
          <p>{page.description}</p>
          <p className="mt-2 text-sm">
            <time dateTime={updatedAt}>{updated}</time> · {copy.policy.draft}
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
