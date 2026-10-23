import 'server-only';

import { siteConfig } from '@/config/site';
import { copy } from '@/content/copy/vi';
import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { formatPriceVND } from '@/lib/catalog/format';
import { presentStatus } from '@/lib/catalog/status';
import { siteUrl } from '@/lib/seo/metadata';

const link = (label: string, path: string, note?: string): string =>
  `- [${label}](${siteUrl(path)})${note ? `: ${note}` : ''}`;

/** Site index for language models, in the llmstxt.org format. */
export const buildLlmsTxt = (): string => {
  const products = getAllSlugs().flatMap((slug) => {
    const product = getProductBySlug(slug);
    if (!product) return [];
    const note = `${formatPriceVND(product.priceVND)}, ${presentStatus(product.status).label}`;
    return [link(product.name.vi, `/products/${slug}`, note)];
  });

  const pages = [
    link(copy.pages.about.title, '/about', copy.pages.about.description),
    link(copy.pages.contact.title, '/contact', copy.pages.contact.description),
    ...siteConfig.policies.map((policy) => link(policy.label, policy.href)),
  ];

  return [
    `# ${copy.site.name}`,
    '',
    `> ${copy.pages.home.description}`,
    '',
    '## Sản phẩm',
    '',
    ...products,
    '',
    '## Trang',
    '',
    ...pages,
    '',
  ].join('\n');
};
