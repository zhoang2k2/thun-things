import 'server-only';

import { createTranslator } from 'next-intl';

import { siteConfig } from '@/config/site';
import { DEFAULT_LOCALE, getMessagesFor } from '@/i18n/messages';
import { localizedPath } from '@/i18n/routing';
import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { formatPriceVND } from '@/lib/catalog/format';
import { siteUrl } from '@/lib/seo/metadata';

// Vietnamese pages until the English index (P5 Task 4).
const link = (label: string, path: string, note?: string): string =>
  `- [${label}](${siteUrl(localizedPath(DEFAULT_LOCALE, path))})${note ? `: ${note}` : ''}`;

/** Site index for language models, in the llmstxt.org format. */
export const buildLlmsTxt = (): string => {
  // A translator because the policy links carry dotted message keys.
  const t = createTranslator({
    locale: DEFAULT_LOCALE,
    messages: getMessagesFor(DEFAULT_LOCALE),
  });

  const products = getAllSlugs().flatMap((slug) => {
    const product = getProductBySlug(slug);
    if (!product) return [];
    const note = `${formatPriceVND(product.priceVND)}, ${t(`product.status.${product.status}`)}`;
    return [link(product.name.vi, `/products/${slug}`, note)];
  });

  const pages = [
    link(t('pages.about.title'), '/about', t('pages.about.description')),
    link(t('pages.contact.title'), '/contact', t('pages.contact.description')),
    ...siteConfig.policies.map((policy) => link(t(policy.labelKey), policy.href)),
  ];

  return [
    `# ${t('site.name')}`,
    '',
    `> ${t('pages.home.description')}`,
    '',
    `## ${t('llms.products')}`,
    '',
    ...products,
    '',
    `## ${t('llms.pages')}`,
    '',
    ...pages,
    '',
  ].join('\n');
};
