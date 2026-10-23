---
name: i18n-seo-guidelines
description: Internationalization (Vietnamese/English) and SEO standards, routing conventions (/vi, /en), metadata generation, JSON-LD, hreflang, and Open Graph.
---

# i18n & SEO Guidelines for Thun Things

## 1. Bilingual Architecture: Vietnamese & English

Thun Things is a bilingual fashion-brand website:

- **Default Locale:** Vietnamese (`vi`).
- **Secondary Locale:** English (`en`).
- **URL Subpaths:** Strict subpath routing:
  - `/[locale]` (e.g. `/vi` and `/en`)
  - Root `/` always redirects permanently to `/vi`; no browser-language detection (P5-1).
- **No Hardcoded Copy:** All user-facing strings must reside in locale message files (`messages/vi.json` and `messages/en.json`).
- **Localized Data Model:** All dynamic catalog fields (product names, descriptions, colors, status notes) must follow the `Localized` type:
  ```ts
  type Locale = 'vi' | 'en';
  type Localized = Record<Locale, string>;
  ```

## 2. Multilingual Routing & Locale Switching

- **Preserve Path on Switch:** When switching languages via the `LocaleSwitcher`, the active path and query parameters must be preserved (e.g., `/vi/products/classic-tee?purpose=order` -> `/en/products/classic-tee?purpose=order`).
- **Routing Library:** `next-intl` App Router integration.

## 3. SEO Metadata & Canonical URLs

- **Dynamic Metadata:** Every page must export an asynchronous `generateMetadata` function providing localized `title`, `description`, and `openGraph`.
- **Title Conventions:**
  - Pattern: `<Page Title> · Thun Things`
  - Fallback / Home: Localized Home title from messages; no invented brand claims
- **Canonical & Hreflang Tags:**
  - Every page must declare a canonical URL matching the current locale.
  - Alternates must declare both `vi` and `en` variants, plus `x-default` pointing to the default locale (`/vi`):
  ```ts
  alternates: {
    canonical: `https://thunthings.com/${locale}/products/${slug}`,
    languages: {
      vi: `https://thunthings.com/vi/products/${slug}`,
      en: `https://thunthings.com/en/products/${slug}`,
      'x-default': `https://thunthings.com/vi/products/${slug}`,
    },
  }
  ```

## 4. Structured Data (JSON-LD)

Structured data must be embedded using `<script type="application/ld+json">`:

- **`Organization`:** Global brand information, logo, social links (`sameAs`).
- **`Product`:** Product detail pages (`/[locale]/products/[slug]`):
  - `name`, `description`, `image`, `sku`.
  - `offers`: `price`, `priceCurrency` (`VND`), and `availability`.
  - **Availability Mapping:** Derive strictly from the data model `status`:
    - `available` / `limited` -> `https://schema.org/InStock`
    - `sold_out` -> `https://schema.org/OutOfStock`
    - `coming_soon` -> `https://schema.org/PreSale`
    - `preorder` -> `https://schema.org/PreOrder`
- **No `BreadcrumbList`:** Omitted by the confirmed P4-4 decision.
- **Language:** `WebSite.inLanguage` follows the page locale. Do not add `inLanguage` to Organization or Product, which do not support that property. Localize product fields and URLs.

## 5. Multilingual Sitemaps & Robots

- **`sitemap.ts`:** Must generate URLs for all supported locales with `<xhtml:link rel="alternate" hreflang="..." />`.
- **`robots.ts`:** Allow crawlers on public pages and declare the sitemap URL (P4). Do not invent API exclusions for routes that do not exist.

## 6. Cache Components and server boundaries

- On Next.js 16.4.2, read the page locale through the `next/root-params` integration in `i18n/request.ts`; consult the installed Next docs before changing rendering boundaries.
- Server Actions validate a hidden locale against `i18n/routing.ts`, default invalid/missing values to `vi`, and localize result redirects. Root params are unavailable in Server Actions.
- Client providers receive only the namespaces their descendants use, never the full bundle.
- Existing catalog `Localized` values are selected by locale; P5 does not translate or edit product content.
- Keep contact result pages out of the sitemap and noindex. Preserve canonical pagination; Contact query parameters do not enter its canonical or language alternates.
- Without JavaScript the switch keeps the path but drops the query: an owner-accepted exception (spec section 3, ADR-008). Do not make the layout render per request to fix it.
- Unknown URLs are rewritten by `proxy.ts` to the prerendered `/{locale}/not-found-page`; add any new page path to the proxy allow-list (`lib/seo/routes.ts` `shellPaths` or the proxy's own list) or it will 404.
