export const policySlugs = ['privacy', 'returns'] as const;
export type PolicySlug = (typeof policySlugs)[number];

export const shellPaths = [
  '/',
  '/about',
  '/contact',
  ...policySlugs.map((slug) => `/policy/${slug}`),
] as const;
