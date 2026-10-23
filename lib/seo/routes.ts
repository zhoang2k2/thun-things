export const policySlugs = ['privacy', 'returns'] as const;
export type PolicySlug = (typeof policySlugs)[number];

export const isPolicySlug = (value: string): value is PolicySlug =>
  (policySlugs as readonly string[]).includes(value);

export const shellPaths = [
  '/',
  '/about',
  '/contact',
  ...policySlugs.map((slug) => `/policy/${slug}`),
] as const;
