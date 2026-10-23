import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getAllSlugs } from '@/lib/catalog';

const knownSlugs = new Set(getAllSlugs());
// No route matches this path, so Next renders its 404 page with a real 404 status.
const NOT_FOUND_PATH = '/__not-found';

// Partial Prerendering streams a 200 before notFound() can run in /products/[slug],
// so unknown slugs are rejected here, before rendering.
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split('/')[2] ?? '';
  if (knownSlugs.has(decodeURIComponent(slug))) return NextResponse.next();
  return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
}

export const config = {
  matcher: '/products/:slug',
};
