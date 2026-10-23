import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { isLocale, routing } from '@/i18n/routing';
import { getAllSlugs } from '@/lib/catalog';
import { shellPaths } from '@/lib/seo/routes';

const handleI18nRouting = createMiddleware(routing);

const knownSlugs = new Set(getAllSlugs());

const pagePaths = new Set<string>([...shellPaths, '/contact/sent', '/contact/retry']);

// Pages that existed before locale routing. Links shared before P5 keep working through a
// permanent redirect to the Vietnamese page.
const LEGACY_PAGE =
  /^\/(about|contact|contact\/sent|contact\/retry|policy\/privacy|policy\/returns)$/;
const LEGACY_PRODUCT = /^\/products\/([^/]+)$/;

const isKnownSlug = (segment: string | undefined) => {
  if (!segment) return false;
  try {
    return knownSlugs.has(decodeURIComponent(segment));
  } catch {
    return false; // Malformed percent-encoding.
  }
};

const notFound = (request: NextRequest) => {
  const candidate = request.nextUrl.pathname.split('/')[1];
  const locale = isLocale(candidate) ? candidate : routing.defaultLocale;
  return NextResponse.rewrite(new URL(`/${locale}/not-found-page`, request.url), { status: 404 });
};

/** Where an unprefixed pre-P5 page now lives, or `undefined` when the path was never a page. */
const legacyTarget = (pathname: string): string | undefined => {
  if (LEGACY_PAGE.test(pathname)) return `/${routing.defaultLocale}${pathname}`;
  const slug = LEGACY_PRODUCT.exec(pathname)?.[1];
  if (isKnownSlug(slug)) return `/${routing.defaultLocale}${pathname}`;
  return undefined;
};

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // `/` → `/vi`, query kept (P5-1: no language detection, so the redirect is permanent).
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}${search}`, request.url), 308);
  }

  const [, first, ...rest] = pathname.split('/');
  if (isLocale(first)) {
    const pagePath = `/${rest.join('/')}`;
    const productPage =
      rest[0] === 'products' &&
      isKnownSlug(rest[1]) &&
      (rest.length === 2 || (rest.length === 3 && rest[2] === 'opengraph-image'));
    if (!pagePaths.has(pagePath) && !productPage) return notFound(request);
    return handleI18nRouting(request);
  }

  const target = legacyTarget(pathname);
  if (target) return NextResponse.redirect(new URL(`${target}${search}`, request.url), 308);

  // Unknown or malformed locales (`/fr`, `/vi-VN`, `/EN`) and any other unprefixed path would
  // otherwise render as `[locale]`; they are a 404, never a redirect.
  return notFound(request);
}

export const config = {
  // Everything but Next internals and the unprefixed metadata routes. Dotted paths are not
  // excluded: `/vi/products/a.b` must still reach the unknown-product 404 and `/fr.x` the site 404
  // (there is no public/ folder to serve files from).
  matcher: [
    '/((?!_next/|__nextjs|_vercel/|robots\\.txt$|sitemap\\.xml$|llms\\.txt$|manifest\\.webmanifest$|icon\\.svg$|apple-icon$|opengraph-image$).*)',
  ],
};
