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
  - Root `/` redirects to the user's preferred locale (or default `/vi`).
- **No Hardcoded Copy:** All user-facing strings must reside in locale message files (`messages/vi.json` and `messages/en.json`).
- **Localized Data Model:** All dynamic catalog fields (product names, descriptions, colors, status notes) must follow the `Localized` type:
  ```ts
  type Locale = 'vi' | 'en';
  type Localized = Record<Locale, string>;
  ```

## 2. Multilingual Routing & Locale Switching

- **Preserve Path on Switch:** When switching languages via the `LocaleSwitcher`, the active path and query parameters must be preserved (e.g., `/vi/shop/classic-tee?purpose=order` -> `/en/shop/classic-tee?purpose=order`).
- **Routing Library:** `next-intl` App Router integration.

## 3. SEO Metadata & Canonical URLs

- **Dynamic Metadata:** Every page must export an asynchronous `generateMetadata` function providing localized `title`, `description`, and `openGraph`.
- **Title Conventions:**
  - Pattern: `<Page Title> — Thun Things`
  - Fallback / Home: `Thun Things — Minimalist & Expressive Streetwear`
- **Canonical & Hreflang Tags:**
  - Every page must declare a canonical URL matching the current locale.
  - Alternates must declare both `vi` and `en` variants, plus `x-default` pointing to the default locale (`/vi`):
  ```ts
  alternates: {
    canonical: `https://thunthings.com/${locale}/shop/${slug}`,
    languages: {
      vi: `https://thunthings.com/vi/shop/${slug}`,
      en: `https://thunthings.com/en/shop/${slug}`,
      'x-default': `https://thunthings.com/vi/shop/${slug}`,
    },
  }
  ```

## 4. Structured Data (JSON-LD)

Structured data must be embedded using `<script type="application/ld+json">`:

- **`Organization`:** Global brand information, logo, social links (`sameAs`).
- **`Product`:** Product detail pages (`/[locale]/shop/[slug]`):
  - `name`, `description`, `image`, `sku`.
  - `offers`: `price`, `priceCurrency` (`VND`), and `availability`.
  - **Availability Mapping:** Derive strictly from the data model `status`:
    - `available` / `limited` -> `https://schema.org/InStock`
    - `sold_out` -> `https://schema.org/OutOfStock`
    - `coming_soon` / `preorder` -> `https://schema.org/PreOrder`
- **`BreadcrumbList`:** For category and product navigation hierarchy.

## 5. Multilingual Sitemaps & Robots

- **`sitemap.ts`:** Must generate URLs for all supported locales with `<xhtml:link rel="alternate" hreflang="..." />`.
- **`robots.ts`:** Allow search engine crawlers on all public pages, disallow private API routes (`/api/*`), and declare sitemap URL.
