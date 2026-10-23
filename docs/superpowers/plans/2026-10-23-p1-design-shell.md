# P1 — Design System & Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Vietnamese-only, accessible site shell — tokens, typeface, sticky white header, footer, Button/Badge primitives, and page shells for Home, About, Contact, Policy — that P2 and P3 fill with content.

**Architecture:** Server Components only (no client JS in P1). Visual decisions live in CSS tokens (`app/globals.css` `@theme`), user-facing strings in `content/copy/vi.ts`, owner-editable non-secret values in `config/site.ts`. Layout components take data as props so they are testable without config.

**Tech Stack:** Next.js 16.4 App Router (`cacheComponents` on), React 19, Tailwind v4 `@theme`, `next/font/google`, `clsx` + `tailwind-merge`, Vitest + RTL, Playwright.

**Spec:** [`../specs/2026-10-23-ui-direction-v3-design.md`](../specs/2026-10-23-ui-direction-v3-design.md), roadmap P1 in [`2026-10-22-roadmap.md`](./2026-10-22-roadmap.md).

**Branch / PR:** `phase/p1-design-shell` → one PR into `develop` (rebase onto `develop` after P0 merges). One commit per task.

## Global Constraints

- Read `node_modules/next/dist/docs/` for fonts, metadata, `robots`, `sitemap`, dynamic params before writing those files (AGENTS.md).
- No `"use client"` in P1. No new dependencies.
- Spacing on the 8-point grid (4 px half-step for icon/text gaps); control heights 32 / 40 / 48 px; mobile touch targets ≥ 44 px.
- Every authored element gets a BEM hook class before Tailwind classes (`SiteHeader`, `SiteHeader__nav`, `Button--primary`).
- No hard-coded user-facing strings outside `content/copy/vi.ts`.
- One `h1` per page; landmarks `header`, `nav`, `main`, `footer`; visible focus (`focus-visible:ring-2`).
- Token defaults (owner may swap later): canvas `#FFFFFF`, ink `#111111`, ink-muted `#5C5C5C`, accent `#FF5A1F`, on-accent `#111111`, line `#E5E5E5`. Typeface **Bricolage Grotesque** (V-03), subsets `latin` + `vietnamese`.
- Design rules DR-1 (no radius) and DR-2 (art/photography/fashion, no "AI slop") in the spec are binding: no `rounded-*`, no gradients, no soft shadows, no decorative icons, no emoji.
- VI/EN control is **not rendered** in P1 (spec V-24).

## Review Focus

1. **Accent contrast:** text placed on the accent colour must be ink, never white (white on `#FF5A1F` is 3.1:1). Pinned by Task 2 test `primary button uses on-accent text`.
2. **Missing owner config:** footer with no email and no socials renders no empty list or dangling label. Pinned by Task 3 test `hides email and socials when unset`.
3. **Unknown policy slug:** `/policy/anything` returns 404, not a blank page. Pinned by Task 5 e2e `unknown policy returns 404`.
4. **Keyboard entry:** first Tab lands on a visible skip link that moves focus to `main`. Pinned by Task 5 e2e `skip link reaches main`.
5. **Radius creeping back in:** a later edit adds `rounded-*` or `border-radius`. Pinned by Task 1 test `design-rules.test.ts`.
6. **Sticky header overlap:** anchored content is not hidden under the sticky header. Pinned by `scroll-padding-top` equal to header height in Task 1 and checked in Task 5 e2e `skip link reaches main` (main top ≥ header bottom).

---

### Task 0: Docs

- [ ] Commit spec, roadmap update, this plan, `thun-things.md` superseded note: `[DOCS] Add UI direction v3 spec and P1 plan`.

### Task 1 (FE): Tokens, typeface, icon library swap, class helper, motion tokens

**Files:**

- Modify: `app/globals.css`, `app/layout.tsx`, `package.json`, `pnpm-lock.yaml`, `docs/architecture/tech-stack.md`
- Create: `lib/cn.ts`, `lib/cn.test.ts`, `components/motion/tokens.ts`, `tests/design-rules.test.ts`

**Interfaces:**

- Produces: `cn(...inputs: ClassValue[]): string`; Tailwind utilities `bg-canvas`, `text-ink`, `text-ink-muted`, `bg-accent`, `text-on-accent`, `border-line`, `font-sans`; CSS variable `--header-height: 64px`; `motion` tokens `{ duration: { instant: 0.1, fast: 0.2, normal: 0.35, slow: 0.6, hero: 1 }, ease: { out: [0.16, 1, 0.3, 1], inOut: [0.65, 0, 0.35, 1] }, stagger: 0.05 } as const` (seconds, for `motion`).

- [ ] **Step 1:** Test `lib/cn.test.ts`: `cn('px-2', 'px-4') === 'px-4'`; `cn('a', false && 'b', undefined, 'c') === 'a c'`.
- [ ] **Step 2:** `pnpm test lib/cn.test.ts` → FAIL (module missing).
- [ ] **Step 3:** `lib/cn.ts` = `twMerge(clsx(inputs))`.
- [ ] **Step 3b:** Icons: `pnpm remove lucide-react && pnpm add -E @hugeicons/react @hugeicons/core-free-icons`; update `tech-stack.md` (Hugeicons replaces lucide, wired in P2).
- [ ] **Step 3c:** Test `tests/design-rules.test.ts` → `no radius outside the glass layer`: scan `app/`, `components/`, `lib/` for `.ts`, `.tsx`, `.css` files; fail on `/\brounded(-[a-z0-9]+)?\b/` or a non-zero `border-radius` (`/border-radius:\s*(?!0\s*[;}])/`) except files under `components/**/glass/`. Also `no gradients`: fail on `bg-gradient-`, `bg-linear-`, `bg-radial-`, `linear-gradient(`, `radial-gradient(`. Also `no lucide imports`: fail on `lucide-react`.
- [ ] **Step 4:** `globals.css`: `@theme` with the colour tokens above and `--font-sans: var(--font-grotesk), ui-sans-serif, system-ui, sans-serif`; `:root { --header-height: 64px }`; `html { scroll-padding-top: var(--header-height) }`; `body` uses `bg-canvas text-ink font-sans antialiased`; `@theme { --radius-*: initial; }` removes Tailwind radius scale; base layer resets native controls (`input, select, textarea, button { border-radius: 0; -webkit-appearance: none; appearance: none }`; the design-rules test allows `border-radius: 0`).
- [ ] **Step 5:** `layout.tsx`: `Bricolage_Grotesque({ subsets: ['latin', 'vietnamese'], variable: '--font-grotesk', display: 'swap' })` applied to `<html>`.
- [ ] **Step 6:** `components/motion/tokens.ts` with the values in Interfaces (no consumer yet; P2 hover card and hero use it).
- [ ] **Step 7:** `pnpm test && pnpm typecheck && pnpm lint && pnpm build` → PASS.
- [ ] **Step 8:** Commit `[FEATURE] Add design tokens, typeface, design-rule guard, and Hugeicons`.

### Task 2 (FE): Button and Badge primitives

**Files:**

- Create: `components/ui/Button.tsx`, `components/ui/Button.test.tsx`, `components/ui/Badge.tsx`, `components/ui/Badge.test.tsx`

**Interfaces:**

- Produces:
  - `type ButtonVariant = 'primary' | 'secondary' | 'ghost'`; `type ButtonSize = 'sm' | 'md' | 'lg'` (heights 32 / 40 / 48 px → `h-8` / `h-10` / `h-12`).
  - `buttonClasses(options?: { variant?: ButtonVariant; size?: ButtonSize; className?: string }): string` — defaults `primary`, `md`; reused by links styled as buttons (P2 message button).
  - `Button(props: ComponentProps<'button'> & { variant?; size? })` — `type="button"` unless overridden; BEM `Button Button--<variant> Button--<size>`.
  - `type BadgeTone = 'neutral' | 'accent' | 'muted'`; `Badge({ tone = 'neutral', children })` renders `<span class="Badge Badge--<tone> ...">`.
- Variant styles: primary `bg-accent text-on-accent`; secondary `border border-ink text-ink bg-canvas`; ghost `text-ink underline-offset-4 hover:underline`.

- [ ] **Step 1:** Tests:
  - `defaults to a medium primary button of type button` → role button, `type="button"`, classes contain `Button--primary`, `h-10`.
  - `primary button uses on-accent text` → class contains `text-on-accent`, not `text-white`.
  - `applies size heights` → `sm` → `h-8`, `lg` → `h-12`.
  - `buttonClasses merges custom classes` → `buttonClasses({ className: 'w-full' })` contains `w-full`.
  - `renders badge tone` → `<Badge tone="accent">Còn hàng</Badge>` has class `Badge--accent` and text.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement both files.
- [ ] **Step 4:** `pnpm test` → PASS; lint, typecheck.
- [ ] **Step 5:** Commit `[FEATURE] Add Button and Badge primitives`.

### Task 3 (FE + BE): Copy module, site config, header, footer, layout

**Files:**

- Create: `content/copy/vi.ts`, `config/site.ts`, `components/layout/SiteHeader.tsx`, `components/layout/SiteHeader.test.tsx`, `components/layout/SiteFooter.tsx`, `components/layout/SiteFooter.test.tsx`, `components/layout/SkipLink.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**

- Produces:
  - `copy` (`as const`): `site { name: 'Thun Things', description }`, `nav { about: 'Giới thiệu', contact: 'Liên hệ', label: 'Điều hướng chính' }`, `footer { policyLabel: 'Chính sách', privacy: 'Bảo mật', returns: 'Đổi trả', emailLabel: 'Email', socialLabel: 'Mạng xã hội' }`, `a11y { skipToContent: 'Chuyển đến nội dung' }`, `pages { home, about, contact, privacy, returns }` each `{ title, description }`.
  - `type NavItem = { href: string; label: string }`; `type SocialLink = { label: string; href: string }`.
  - `siteConfig = { name: copy.site.name, contactEmail: undefined as string | undefined, socials: [] as SocialLink[], nav: NavItem[] /* About /about, Contact /contact */, policies: NavItem[] /* /policy/privacy, /policy/returns */ }`. Owner edits `contactEmail` and `socials` here.
  - `SiteHeader({ nav }: { nav: NavItem[] })` — `<header class="SiteHeader sticky top-0 z-40 h-[var(--header-height)] bg-canvas border-b border-line">`, logo `<Link href="/">` with wordmark text, `<nav aria-label={copy.nav.label}>`.
  - `SiteFooter({ policies, contactEmail, socials }: { policies: NavItem[]; contactEmail?: string; socials: SocialLink[] })` — policy list; email as `mailto:` only when set; socials list only when non-empty; oversized wordmark `aria-hidden="true"`.
  - `SkipLink()` — `<a href="#main">` visually hidden until focused.
- `layout.tsx` renders `SkipLink`, `SiteHeader`, `<main id="main" tabIndex={-1}>`, `SiteFooter`, passing `siteConfig` values.

- [ ] **Step 1:** Header tests: `renders a banner with the main navigation` (role `banner`; nav named `Điều hướng chính`; links `Giới thiệu` → `/about`, `Liên hệ` → `/contact`; logo link → `/`); `does not render a language switch` (no text `VI`/`EN`).
- [ ] **Step 2:** Footer tests: `renders policy links` (`Bảo mật` → `/policy/privacy`, `Đổi trả` → `/policy/returns`); `hides email and socials when unset` (no `mailto:` link, no `Mạng xã hội` heading); `shows email and socials when set` (`mailto:hi@example.com`, Instagram link with `rel` containing `noopener`).
- [ ] **Step 3:** Run → FAIL.
- [ ] **Step 4:** Implement copy, config, components, layout wiring. Header inner container `mx-auto max-w-screen-2xl px-4 md:px-8`; nav links min height 44 px on mobile.
- [ ] **Step 5:** `pnpm test`, lint, typecheck, build → PASS.
- [ ] **Step 6:** Commit `[FEATURE] Add site header, footer, and copy module`.

### Task 4 (BE): Page shells, metadata helper, robots, sitemap

**Files:**

- Create: `lib/seo/metadata.ts`, `lib/seo/metadata.test.ts`, `app/about/page.tsx`, `app/contact/page.tsx`, `app/policy/[slug]/page.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/sitemap.test.ts`
- Modify: `app/page.tsx`, `app/page.test.tsx`, `app/layout.tsx` (root metadata via helper)

**Interfaces:**

- Consumes: `env.NEXT_PUBLIC_SITE_URL` from `@/lib/env`; `copy.pages`.
- Produces:
  - `buildMetadata({ title, description, path }: { title?: string; description: string; path: string }): Metadata` → `metadataBase: new URL(siteUrl)`, `title` (root uses template `%s · Thun Things`, default `Thun Things`), `description`, `alternates.canonical: path`, `openGraph { title, description, url: path, siteName: 'Thun Things', locale: 'vi_VN', type: 'website' }`.
  - `policySlugs = ['privacy', 'returns'] as const`; `type PolicySlug`.
  - `sitemap()` returns entries for `/`, `/about`, `/contact`, `/policy/privacy`, `/policy/returns` prefixed with the site URL.
  - `robots()` allows all, `sitemap: <siteUrl>/sitemap.xml`.
- Pages render one `h1` from `copy.pages.*.title` plus a placeholder paragraph from copy; Home `h1` is `Thun Things` with a reserved hero region (`aspect` none, `min-h-[70vh]`, `aria-hidden` decorative block) so P2 drops the slideshow in without layout change.
- Policy page: `generateStaticParams` returns `policySlugs`; unknown slug → `notFound()` (`dynamicParams = false` if supported by this Next version; otherwise guard).

- [ ] **Step 1:** Tests: `metadata.test.ts` — `builds canonical and open graph from path` (`buildMetadata({ title: 'Giới thiệu', description: 'd', path: '/about' })` → `alternates.canonical === '/about'`, `openGraph.locale === 'vi_VN'`, `metadataBase.href === 'http://localhost:3000/'`). `sitemap.test.ts` — `lists every shell page` (5 URLs, all start with `http://localhost:3000`). Mock `server-only`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement helper, robots, sitemap, pages; update home test to still find `h1` `Thun Things`.
- [ ] **Step 4:** `pnpm test`, lint, typecheck, build → PASS; build output lists `/about`, `/contact`, `/policy/privacy`, `/policy/returns`, `/robots.txt`, `/sitemap.xml` as static.
- [ ] **Step 5:** Commit `[FEATURE] Add page shells, metadata, robots, and sitemap`.

### Task 5 (FE + BE): Navigation smoke, decisions, status

**Files:**

- Create: `e2e/navigation.spec.ts`
- Modify: `docs/decisions/README.md` (ADR-006), `docs/superpowers/plans/2026-10-22-roadmap.md` (P1 status), this plan (ticks)

- [ ] **Step 1:** E2E tests:
  - `header navigates to about and contact` → click `Giới thiệu` → URL `/about`, `h1` visible; click `Liên hệ` → `/contact`.
  - `policy pages render` → `/policy/privacy` and `/policy/returns` status 200 with one `h1`.
  - `unknown policy returns 404` → `/policy/anything` status 404.
  - `skip link reaches main` → first `Tab` focuses link `Chuyển đến nội dung`; `Enter` → `main` focused; `main` bounding box top ≥ header bottom.
  - `header stays visible after scroll` → scroll 2000 px on `/`, header bounding box top === 0.
- [ ] **Step 2:** `pnpm test:e2e` → PASS (both smoke and navigation specs).
- [ ] **Step 3:** ADR-006 "UI Direction v3 shell": Bricolage Grotesque, `#FF5A1F` accent as a swappable default, design rules DR-1/DR-2 and their test, Hugeicons replacing lucide, Server-Components-only shell, owner config in `config/site.ts`.
- [ ] **Step 4:** Full suite: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e` → PASS; set roadmap P1 to `IN REVIEW`.
- [ ] **Step 5:** Commit `[TASK] Add navigation smoke tests and record shell decisions`; push; open PR `[FEATURE] P1 design system and site shell` into `develop`.

## P1 Acceptance (gate for P2)

- [ ] CI green on the PR.
- [ ] Keyboard-only walkthrough: skip link, header links, footer links all reachable with visible focus.
- [ ] Lighthouse accessibility ≥ 95 on `/`, `/about`, `/contact`, `/policy/privacy` (run on the Vercel preview or locally with `pnpm build && pnpm start`).
- [ ] No font CLS (Bricolage Grotesque via `next/font`, `display: 'swap'`, variable font).
- [ ] Vercel preview reachable (owner task).
- [ ] Owner merged the PR; roadmap P1 = `DONE`.
