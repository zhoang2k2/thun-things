import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { isLocale, routing } from '@/i18n/routing';
import { getAllSlugs } from '@/lib/catalog';

const handleI18nRouting = createMiddleware(routing);

const knownSlugs = new Set(getAllSlugs());

// Matches no route (`[locale]` has no catch-all), so Next renders app/global-not-found.tsx with
// a real 404 status.
const NOT_FOUND_PATH = '/vi/__not-found';

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

const notFound = (request: NextRequest) =>
  NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));

/** Where an unprefixed pre-P5 page now lives, or `undefined` when the path was never a page. */
const legacyTarget = (pathname: string): string | undefined => {
  if (LEGACY_PAGE.test(pathname)) return `/${routing.defaultLocale}${pathname}`;
  const slug = LEGACY_PRODUCT.exec(pathname)?.[1];
  if (isKnownSlug(slug)) return `/${routing.defaultLocale}${pathname}`;
  return undefined;
};

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // `/` → `/vi` (P5-1: no language detection).
  if (pathname === '/') return handleI18nRouting(request);

  const [, first, ...rest] = pathname.split('/');
  if (isLocale(first)) {
    // Partial Prerendering streams a 200 before notFound() can run in /[locale]/products/[slug],
    // so unknown slugs (and their share images) are rejected here, before rendering.
    if (rest[0] === 'products' && rest.length > 1 && !isKnownSlug(rest[1])) {
      return notFound(request);
    }
    return handleI18nRouting(request);
  }

  const target = legacyTarget(pathname);
  if (target) return NextResponse.redirect(new URL(`${target}${search}`, request.url), 308);

  // Unknown or malformed locales (`/fr`, `/vi-VN`, `/EN`) and any other unprefixed path would
  // otherwise render as `[locale]`; they are a 404, never a redirect.
  return notFound(request);
}

export const config = {
  // Everything but Next internals, metadata routes and files with an extension.
  matcher: [
    '/((?!_next/|_vercel/|robots\\.txt|sitemap\\.xml|llms\\.txt|manifest\\.webmanifest|icon\\.svg|apple-icon|opengraph-image|.*\\..*).*)',
  ],
};
