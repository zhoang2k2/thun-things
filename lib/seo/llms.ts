import 'server-only';

import { createTranslator } from 'next-intl';

import { siteConfig } from '@/config/site';
import { getMessagesFor } from '@/i18n/messages';
import { type Locale, localizedPath, routing } from '@/i18n/routing';
import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { formatPriceVND } from '@/lib/catalog/format';
import { siteUrl } from '@/lib/seo/metadata';

const link = (locale: Locale, label: string, path: string, note?: string): string =>
  `- [${label}](${siteUrl(localizedPath(locale, path))})${note ? `: ${note}` : ''}`;

/** English site index listing both locales, in the llmstxt.org format. */
export const buildLlmsTxt = (): string => {
  const messages = getMessagesFor('en');
  const t = createTranslator({ locale: 'en', messages });
  const products = routing.locales.flatMap((locale) =>
    getAllSlugs().flatMap((slug) => {
      const product = getProductBySlug(slug);
      if (!product) return [];
      const note = `${formatPriceVND(product.priceVND, 'en')}, ${t(`product.status.${product.status}`)}`;
      return [link(locale, `${product.name[locale]} (${locale})`, `/products/${slug}`, note)];
    }),
  );
  const pages = routing.locales.flatMap((locale) => [
    link(locale, `Home (${locale})`, '/'),
    link(locale, `${t('pages.about.title')} (${locale})`, '/about', t('pages.about.description')),
    link(
      locale,
      `${t('pages.contact.title')} (${locale})`,
      '/contact',
      t('pages.contact.description'),
    ),
    ...siteConfig.policies.map((policy) =>
      link(locale, `${t(policy.labelKey)} (${locale})`, policy.href),
    ),
  ]);
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
