# Thun Things — Brainstorm, Strategy & Delivery Plan

> Single source of truth for AI agents (Claude Code, Codex, Antigravity) and the owner.
> **Part 1:** Brainstorm & strategy (decisions D-xx, risks R-xx, data model, folder structure).
> **Part 2:** Phased delivery plan (P0 to P7, FE / BE / GOAL, milestones, owner manual tasks).
> Where Part 2 conflicts with older text, "UI Direction v2" at the top of Part 1 wins.

---

# Part 1 — Brainstorm & Strategy Brief

> **Audience:** AI coding/planning agents (Claude Code, Codex, Antigravity, others).
> **Companion section:** Part 2 below (phased delivery plan).
> **Owner:** a solo developer, < 10 h/week available. Reply language to the owner: Vietnamese. Code, docs, identifiers: English.

---

> **Superseded (2026-10-23) [USER]:** UI Direction v3 in [`docs/superpowers/specs/2026-10-23-ui-direction-v3-design.md`](./docs/superpowers/specs/2026-10-23-ui-direction-v3-design.md) replaces v2 wherever they conflict (no `/shop` page, image-only grid with hover card, banner slideshow hero, sticky white header).

## UI Direction v2 (2026-10-14) — supersedes conflicting UI text below

The owner revisited the UI mindset through a user-journey Q&A (what the user sees, can do, and how they interact). Where older sections conflict with this block, **this block wins**. Items marked [USER] were chosen by the owner; [PROPOSED] are agent additions awaiting confirmation.

| ID    | Decision                                                                                                                                                                                                                                                                | Source     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| D-16  | Home opens with a **pinned, scroll-driven hero**: the hero stays fixed while images change with the scroll rhythm. It must look like a fashion-shop hero (image-led). **Avoid the generic "big title + button + badge" template hero.**                                 | [USER]     |
| D-17  | The product list appears only after the hero finishes (scroll to reveal).                                                                                                                                                                                               | [USER]     |
| D-18  | Home product block = **one horizontally draggable grid of 2–3 rows**. A single drag shifts the whole block together (not per-row rails, not parallax rows).                                                                                                             | [USER]     |
| D-19  | Hover (desktop) / touch (mobile) on a product reveals the **lifestyle (model-wearing) photo** with a strong cut/clip-style reveal effect.                                                                                                                               | [USER]     |
| D-19a | Touch alternative: first tap previews the reveal, second tap opens the product; keyboard focus triggers the same reveal.                                                                                                                                                | [PROPOSED] |
| D-20  | Selecting a product goes to its **own page** `/shop/[slug]`; the product image flies/zooms into the detail page (shared-element transition).                                                                                                                            | [USER]     |
| D-21  | PDP CTA button(s) navigate to the **Contact page** with the product pre-filled (no inline waitlist form on PDP).                                                                                                                                                        | [USER]     |
| D-22  | Contact page = **one shared form**: product pre-filled, purpose selector (order / notify-me when available / other question), then email, name, message. Waitlist and contact are merged into this form.                                                                | [USER]     |
| D-22a | Default `purpose` is derived from product `status` (e.g. `sold_out`/`coming_soon` → notify, `available`/`preorder` → order).                                                                                                                                            | [PROPOSED] |
| D-23  | Quiz bot = **corner launcher button that opens a small card** (color/vibe chosen inside the card) **plus a proactive speech bubble** from the bot.                                                                                                                      | [USER]     |
| D-24  | The proactive bubble **repeats every 30–60 s** and has a dismiss button.                                                                                                                                                                                                | [USER]     |
| D-24a | Guardrail: cap the number of bubble appearances per session, stay silent after dismissal, stop under `prefers-reduced-motion`. Reason: repeating auto-appearing content can annoy users and conflicts with WCAG 2.2 "pause, stop, hide" expectations. Owner may reject. | [PROPOSED] |
| D-25  | Header is **transparent over the hero**, then becomes a fixed bar after the hero.                                                                                                                                                                                       | [USER]     |
| D-26  | A separate **`/shop` page stays**, with the full grid + filters; the Home block is a shortened version.                                                                                                                                                                 | [USER]     |

**Superseded or refined older items:** D-05 (sold-out CTA now = Contact with `purpose`, not an inline waitlist form), D-08 (form → email; leads now carry `purpose`), D-09 (corner popup refined by D-23/D-24), D-11/D-12 (hover reveal now specifically the lifestyle photo), §6.1 Home/Contact, §6.2 CTA table, §7.2 steps, §9 lead record, §10.3 events.

**Resolved items (owner interview, 2026-10-14):**

| ID   | Decision                                                                                                                                                                                                      | Source     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| O-01 | Hero: D-16 only (the older "giant brand typography + tee passing through letters" idea is dropped). 4–5 frames, text = brand logo/name only. Scroll distance: agent proposes.                                 | [USER]     |
| O-02 | `/shop`: static white multi-column grid + color/status filters.                                                                                                                                               | [USER]     |
| O-03 | Quiz card: color via swatches, vibe via text chips (vibe step auto-skips if < 2 vibes); result = **1 featured product + "see more" button** (replaces "up to 3 cards").                                       | [USER]     |
| O-04 | Bubble: guardrails D-24a accepted (cap per session, silent after dismissal, off under reduced-motion); shown on **all pages except Contact and Policy**. Default cap 3/session.                               | [USER]     |
| O-05 | About: minimal (one text block + one photo). Footer: minimal (nav, language switch, Policy link, contact email). Policy: minimal text pages.                                                                  | [USER]     |
| O-06 | Fallback for card → PDP transition: simple fade/crossfade.                                                                                                                                                    | [USER]     |
| O-07 | Reduced-motion / keyboard / screen reader: owner delegated. Agent default: hero becomes stacked static frames; drag block gets prev/next buttons + native horizontal scroll; focus order follows DOM.         | [PROPOSED] |
| O-08 | No lifestyle photos exist yet. Build as if they exist, using a **placeholder component with several statuses** (see plan P2) so reveal animations can be developed and judged. Real photos are an owner task. | [USER]     |

---|---|---|
| O-01 | Hero storyboard: how many frames, which photos in what order, any text at all, hero height in scroll distance | 4–5 frames from existing lifestyle/back photos, minimal text (brand mark only) |
| O-02 | `/shop` layout details (is it also draggable, or a static multi-column grid?) | Static multi-column grid + color/status filters |
| O-03 | Quiz card content: question copy, option visuals, result presentation inside the small card | Color step → vibe step (auto-skip if < 2 vibes) → up to 3 result cards |
| O-04 | Bubble copy, per-session cap, which pages show it | Home and PDP only; cap 3 per session |
| O-05 | UI for About, Policy, Footer under the new mindset (not yet revisited) | Keep minimal white pages consistent with motion tokens |
| O-06 | Fallback when shared-element transition is unsupported or reduced-motion is on | Simple fade/crossfade |
| O-07 | Keyboard/screen-reader alternative for the pinned hero and the draggable block | Static stacked hero frames; prev/next buttons + native scroll for the block |
| O-08 | Lifestyle photo availability: does every product have one? | Fall back to the back photo, then the front photo |

---

## 0. How agents must use this document

1. Every statement is tagged: **[USER]** = stated by the owner, **[PROPOSED]** = agent recommendation awaiting confirmation, **[ASSUMPTION]** = unverified, **[OPEN]** = unresolved.
2. Do not promote a **[PROPOSED]** or **[ASSUMPTION]** item to a fact. If a task depends on an **[OPEN]** item, ask the owner (max 3 targeted questions), then continue with the stated default.
3. Prefer the smallest change that satisfies the current phase. Do not generate the whole system at once.
4. Respect the constraints in §5 and the flagged risks in §13 in every task.

---

## 1. Snapshot

| Item             | Value                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Brand            | **Thun Things**                                                                            |
| Business         | Selling T-shirts (fewer than 10 designs today) [USER]                                      |
| Site type        | Brand/business website with catalog. **No cart, no checkout** for now; contact-only [USER] |
| Languages        | Vietnamese + English, URL subpaths `/vi` and `/en` [USER]                                  |
| Differentiators  | Very creative, motion-rich white minimal UI; AI quiz bot that filters products [USER]      |
| Near-term goal   | Marketing / build FOMO / waitlist; later real sales [USER]                                 |
| Longer-term goal | Apply for Claude for Startups (see §12 — not currently eligible) [USER]                    |
| Domain & mailbox | Not yet; to be bought after the website is done [USER]                                     |

---

## 2. Goals and success signals

| Horizon     | Goal [USER]                                         | Suggested measurable signal [PROPOSED]                                            |
| ----------- | --------------------------------------------------- | --------------------------------------------------------------------------------- |
| Short term  | Marketing and anticipation (FOMO); collect interest | Waitlist signups, quiz completions, contact submissions, returning visitors (GA4) |
| Short term  | Look credible and distinctive                       | Core Web Vitals "good", Lighthouse a11y ≥ 95, strong social previews              |
| Medium term | Real sales                                          | Checkout readiness (data model already supports it; see §9)                       |
| Medium term | Claude for Startups                                 | Traction evidence + real Claude integration + funding (see §12)                   |

GA4 is required to learn what users care about and whether traffic is healthy [USER].

---

## 3. Confirmed decisions (from the owner interview)

| ID   | Decision                                                                                                                                                                                                              | Source            |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| D-01 | Solo developer, < 10 h/week                                                                                                                                                                                           | [USER]            |
| D-02 | Bilingual vi/en with `/vi` and `/en` subpaths                                                                                                                                                                         | [USER]            |
| D-03 | Catalog = TypeScript data + Zod schema in the repo; migrate to Supabase later. Access only through a data-access layer                                                                                                | [USER]            |
| D-04 | Product statuses to support: `sold_out` and `coming_soon` / `preorder` (plus normal availability)                                                                                                                     | [USER]            |
| D-05 | Sold-out CTA = waitlist email signup **and** contact-to-preorder. _(v2: now handled by the Contact page `purpose` selector — see D-21/D-22)_                                                                          | [USER]            |
| D-06 | Prices are shown clearly                                                                                                                                                                                              | [USER]            |
| D-07 | "Sold out" is currently a **marketing tactic** (real products and photos exist). See §13 R-01                                                                                                                         | [USER]            |
| D-08 | Contact: form → email only for now. Later: fanpage / Instagram / Zalo. Later: persist leads to Google Sheet or Supabase                                                                                               | [USER]            |
| D-09 | Quiz bot appears as a **corner popup**; v1 is tap-to-choose quiz; free-text chat is a later phase                                                                                                                     | [USER]            |
| D-10 | Quiz attributes: **color** and **vibe/style**. Vibe taxonomy decided later                                                                                                                                            | [USER]            |
| D-11 | Design: white minimal, very creative, synchronized motion, hover reveals tooltip/video-like content. Fashion shop, not SaaS                                                                                           | [USER]            |
| D-12 | Hover/motion content: back-side and lifestyle photos already exist                                                                                                                                                    | [USER]            |
| D-13 | Extra page: Policy (returns, privacy). More tabs welcome as suggestions                                                                                                                                               | [USER]            |
| D-14 | GA4 behind a cookie-consent banner; GA4 loads only after consent                                                                                                                                                      | [USER]            |
| D-15 | Bot v1 AI level: **quiz logic is deterministic; an LLM writes a short "why this fits you" blurb — Gemini first, Anthropic (Claude) as fallback on a missing key or failure, cheapest models by default (P8-1, P8-2)** | [USER] 2026-10-24 |

---

## 4. Assumptions to validate

| ID   | Assumption                                                     | Default if unanswered                                                      |
| ---- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| A-01 | Target audience: young adults in Vietnam, mobile-first traffic | Design mobile-first                                                        |
| A-02 | Currency VND only                                              | Store `priceVND` as integer                                                |
| A-03 | Hosting on Vercel                                              | Yes, with SSG/ISR + route handlers (not a static export)                   |
| A-04 | Brand assets (logo, palette, typography) are not finalized     | Create design tokens that are easy to swap                                 |
| A-05 | Shipping/returns policy text does not exist yet                | Ship placeholder pages flagged `TODO(owner)` and block launch on real text |
| A-06 | Fewer than 10 products means no search/pagination needed       | Simple grid with filters                                                   |

---

## 5. Constraints

- **Capacity:** one person, < 10 h/week → small, shippable increments; each phase ends in a deployable build.
- **Stack baseline:** Next.js App Router, TypeScript **strict**, React, Tailwind. Minimal dependencies. Prefer TypeScript-first and a clear folder structure.
- **Quality:** semantic HTML, accessibility (WCAG 2.2 AA target), SEO, Core Web Vitals.
- **No cart/checkout** until the owner decides otherwise.
- **UI states:** every data-driven component handles loading / error / empty.
- **Tests:** React Testing Library for key UI components; Playwright smoke tests for core flows.
- **No fabricated urgency** (see §13 R-01): no fake countdowns, fake "N people viewing", or fake "only 2 left" counters.
- **Version pinning:** Current Next.js stable releases require React 19; the owner's stated baseline is React 18. **[OPEN]** Decide at scaffold time and record it in `docs/decisions.md`. Default: use the latest stable Next.js with the React version it requires.

---

## 6. Product & UX concept

### 6.1 Information architecture

```
/[locale]                      Home (pinned scroll-driven hero → draggable 2–3-row product block; quiz launcher floats in corner; header transparent over hero) [v2]
/[locale]/shop                 Full catalog grid + filters (color, vibe, status) [v2: kept; Home block is the short version]
/[locale]/shop/[slug]          Product detail (gallery, price, status, CTA)
/[locale]/about                Brand story
/[locale]/contact              One shared form: product pre-filled, purpose selector, email, name, message [v2]
/[locale]/policy/privacy       Privacy & cookies
/[locale]/policy/returns       Returns / shipping / pre-order terms
```

Suggested later tabs [PROPOSED]: `/drops` (collections and release schedule), `/size-guide` + FAQ, `/journal` (SEO content; only if capacity allows), `/lookbook` (can merge into drops).

### 6.2 Product status model and CTAs

| `status`      | Label (vi / en)             | Primary CTA                            | Secondary CTA                          |
| ------------- | --------------------------- | -------------------------------------- | -------------------------------------- |
| `available`   | Còn hàng / Available        | Contact to order (`purpose=order`)     | —                                      |
| `limited`     | Số lượng giới hạn / Limited | Contact to order (`purpose=order`)     | —                                      |
| `sold_out`    | Hết hàng / Sold out         | Notify me (`purpose=notify`)           | Contact to pre-order (`purpose=order`) |
| `coming_soon` | Sắp ra mắt / Coming soon    | Notify me (`purpose=notify`)           | —                                      |
| `preorder`    | Đặt trước / Pre-order       | Contact to pre-order (`purpose=order`) | Notify me (`purpose=notify`)           |

v2: every CTA is a link to `/[locale]/contact?product=<slug>&purpose=<order|notify|other>`; there is no inline form on the PDP (D-21). The `purpose` default per status is [PROPOSED] (D-22a).

Rules:

- Status lives in catalog data per product (and optionally per variant), never hard-coded in components.
- Every CTA fires a GA4 event (see §10.3) so the owner can see which products attract interest.
- JSON-LD `availability` must be derived from the same `status` field so page text and structured data never disagree.

### 6.3 Visual and motion direction [USER]

- White, minimal canvas with expressive, synchronized motion. Not flat UI; not simple hover color changes.
- v2: hover/touch on a product reveals the **lifestyle photo** with a strong cut/clip-style reveal (D-19). Back photo and short video are secondary/later.
- v2: pinned scroll-driven hero (D-16), draggable 2–3-row product block (D-18), shared-element transition card → PDP (D-20), header transparent → fixed (D-25). Each needs a keyboard, touch and `prefers-reduced-motion` alternative (O-06, O-07, resolved above).
- Technical guardrails [PROPOSED]:
  - A single **motion token file** (durations, easings, stagger) so all animation is coherent.
  - Honor `prefers-reduced-motion`; provide a non-hover alternative on touch devices (tap-to-preview or auto-cycling images).
  - Lazy-load hover media; never put heavy media in the LCP path; reserve dimensions to avoid CLS.
  - Animate `transform`/`opacity` only; keep INP healthy.
  - Library choice: `motion` (Framer Motion successor) for React interaction/layout transitions; add GSAP only if a specific effect needs it. CSS-first for simple effects.

---

## 7. AI quiz bot

### 7.1 Concept

A corner popup ("assistant") that asks a few tap-to-choose questions and returns matching products from the real catalog. It must feel like being advised, not like operating a filter.

### 7.2 v1 behavior [PROPOSED, built on D-09/D-10/D-15]

0. (v2) A corner launcher button is always visible; a proactive speech bubble appears every 30–60 s with a dismiss button (D-23/D-24; caps per D-24a).
1. User taps the launcher → small card opens → Step 1: **color** (options derived from catalog colors).
2. Step 2: **vibe** (options derived from catalog `vibes` tags). If the catalog has fewer than 2 distinct vibes, skip this step automatically (taxonomy is still undecided).
3. Deterministic scoring (`lib/recommend`) ranks products; `sold_out`/`coming_soon` items still appear but with their status and waitlist CTA.
4. Result view (v2, O-03): **one featured product** with a 1–2 sentence **AI-written rationale** (Gemini, Claude fallback; P8) and a "see more" button (opens `/shop` filtered by the chosen color/vibe). If the API call fails or times out (e.g., 4 s), show results without rationale (graceful degradation).
5. Events: `quiz_open`, `quiz_step`, `quiz_complete`, `quiz_result_click`, `quiz_bubble_shown`, `quiz_bubble_dismiss`.

### 7.3 Why not a free-text chatbot in v1

- Catalog is tiny (< 10 designs); the value is brand experience, not retrieval.
- Free text adds cost, abuse surface, and prompt-injection risk.
- v2 upgrade path: Claude converts free text into **structured filter params via tool use**, then the same deterministic ranking runs. Claude never invents products.

### 7.4 AI safety, cost and privacy guardrails

- Server-side only; API key never reaches the client.
- Validate input with Zod (enum answers only in v1). Cap output length. Prompt contains only catalog facts and the user's enum answers.
- Rate limit per IP (Vercel Firewall or a small Redis-backed limiter). Spend controls: budget alert in Google Cloud Billing (Gemini; paid tier in production, since free-tier requests may be used to improve Google products) and a hard monthly cap in the Anthropic Console.
- Model names come from env vars (`GEMINI_MODEL`, `ANTHROPIC_MODEL`); do not hard-code them. Provider order: Gemini, then Anthropic (P8-1).
- Do not store quiz answers tied to identity in v1. If analytics need them, send only anonymous, aggregated events and only after cookie consent.
- Disclose in the privacy policy that quiz answers are processed by an AI provider (Google Gemini API, Anthropic).

---

## 8. Architecture & tech stack

### 8.1 Stack

| Layer         | Choice                                                         | Notes                                                                |
| ------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| Framework     | Next.js App Router, TypeScript strict                          | SSG/ISR for pages; route handlers for API                            |
| Styling       | Tailwind CSS + CSS variables for tokens                        | Easy rebranding                                                      |
| i18n          | `next-intl` (or equivalent) with `/vi`, `/en`                  | Default locale `vi`; `hreflang` + `x-default`                        |
| Validation    | Zod                                                            | Shared between catalog, forms, API                                   |
| Motion        | `motion` (+ CSS)                                               | See §6.3                                                             |
| Email         | Resend                                                         | Needs a verified domain for production sending (domain bought later) |
| AI            | Google Gemini API, Anthropic API fallback, server route        | Pay-as-you-go until credits are possible                             |
| Analytics     | GA4 with Consent Mode                                          | Loaded only after consent                                            |
| Rate limiting | Vercel Firewall or Upstash Ratelimit                           | Serverless: in-memory counters do not work                           |
| Tests         | Vitest + React Testing Library; Playwright smoke; axe for a11y |                                                                      |
| Hosting       | Vercel                                                         |                                                                      |

### 8.2 Catalog storage comparison (decision D-03)

| Criterion            | TS data + Zod (chosen)      | Supabase + Prisma    | Headless CMS              |
| -------------------- | --------------------------- | -------------------- | ------------------------- |
| SEO                  | Excellent (build-time HTML) | Good                 | Good                      |
| Complexity           | Lowest                      | Medium               | Medium + external service |
| Edit workflow        | Edit file + deploy          | DB/admin UI to build | Built-in UI               |
| Cost                 | Free                        | Free tier, then paid | Free tier limits          |
| Fit for < 10 designs | Best                        | Overkill now         | Slightly overkill         |
| Path to cart later   | Migrate                     | Ready                | Needs extra pieces        |

Mitigation: all reads go through `lib/catalog` (interface), so swapping the source later does not touch UI or the bot.

### 8.3 Suggested folder structure

```
app/
  [locale]/
    layout.tsx
    page.tsx
    shop/page.tsx
    shop/[slug]/page.tsx
    about/page.tsx
    contact/page.tsx
    policy/[slug]/page.tsx
  api/
    contact/route.ts      (v2: waitlist merged in; `purpose` field)
    quiz/recommend/route.ts
    quiz/explain/route.ts
  sitemap.ts
  robots.ts
components/
  ui/            primitives (Button, Input, Dialog)
  layout/        Header (transparent over hero → fixed), Footer, LocaleSwitcher
  home/          HeroScroll (pinned, scroll-driven), ProductDragGrid (2–3 rows, drag moves whole block)
  shop/          ProductCard (lifestyle clip reveal), ProductGrid (/shop full grid), StatusBadge, SharedImageTransition
  quiz/          QuizLauncher, QuizBubble, QuizPopup (small card), QuizStep, QuizResult
  motion/        tokens.ts, Reveal, Stagger
lib/
  catalog/       schema.ts, data.ts, index.ts  (data-access layer)
  recommend/     score.ts
  ai/            explain.ts
  leads/         sink.ts (interface), email.ts, sheet.ts (later), supabase.ts (later)
  analytics/     events.ts, consent.ts
  i18n/          config.ts
  env.ts         Zod-validated env
messages/        vi.json, en.json
content/policies/
docs/            brainstorm + plan + decisions.md
```

Note: because route handlers are required, this is **not** a static export deployment.

---

## 9. Data model (initial)

```ts
// lib/catalog/schema.ts  (Zod; shown as TS types for brevity)
type Locale = 'vi' | 'en';
type Localized = Record<Locale, string>;

type ProductStatus = 'available' | 'limited' | 'sold_out' | 'coming_soon' | 'preorder';

interface Product {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  priceVND: number; // integer
  status: ProductStatus;
  statusNote?: Localized; // e.g. "Next drop in spring"
  colors: { id: string; label: Localized; hex: string }[];
  vibes: string[]; // free tags now; taxonomy decided later
  sizes?: string[];
  material?: Localized;
  media: {
    front: ImageAsset;
    back?: ImageAsset; // hover
    lifestyle?: ImageAsset[];
    hoverVideo?: { src: string; poster: ImageAsset }; // later
  };
  dropId?: string;
  releasedAt?: string; // ISO date
  seo?: { title?: Localized; description?: Localized };
}

interface ImageAsset {
  src: string;
  width: number;
  height: number;
  alt: Localized;
}
```

Forward-compat for checkout: keep `id`, integer price, and per-variant fields stable so a future cart/orders table can reference them.

Lead records (single Contact form, v2): `{ purpose: 'order' | 'notify' | 'other', email, name, message?, productId?, locale, consent, createdAt }`, written through `LeadSink` (interface) so email-only now → Google Sheet/Supabase later without touching forms.

---

## 10. SEO, i18n, analytics, privacy

### 10.1 SEO / i18n

- `generateMetadata` per locale; canonical URLs; `alternates.languages` (`hreflang`) incl. `x-default`.
- Multilingual `sitemap.ts` and `robots.ts`.
- JSON-LD: `Organization`, `Product` (with `offers.availability` from `status`), `BreadcrumbList`.
- Open Graph/Twitter images per product.
- Semantic landmarks, one `h1` per page, meaningful `alt` text.
- Core Web Vitals budgets [PROPOSED]: LCP < 2.5 s, INP < 200 ms, CLS < 0.1 on mid-range mobile.

### 10.2 Privacy / consent

- Cookie banner; GA4 (and any non-essential storage) off until consent; consent stored locally and revocable.
- Privacy page must cover: email collection (waitlist/contact), GA4, AI processing of quiz answers, retention, contact for data requests.
- **[OPEN]** Verify current Vietnamese personal-data requirements (e.g., Decree 13/2023/ND-CP and any newer law) and EU/GDPR exposure if `/en` traffic is international. The owner should confirm with a qualified advisor; this document is not legal advice.

### 10.3 GA4 event plan

`view_item`, `select_item`, `contact_start`, `contact_submit` (param `purpose`), `hover_preview_open`, `quiz_open`, `quiz_step`, `quiz_complete`, `quiz_result_click`, `quiz_bubble_shown`, `quiz_bubble_dismiss`, `locale_switch`. Parameters: `product_id`, `status`, `locale`, `purpose`. No personal data in event parameters.

---

## 11. Benchmarks (unverified candidates)

The owner asked for a top-5 of Vietnamese T-shirt shops and local brands. Available sources were marketplace blogs, not reliable rankings, so **no ranking is claimed**. Candidates seen in sources: Coolmate (mass-market basics, tee prices around 149k–269k VND per a Shopee blog), 5THEWAY, DKMV, Outfix Saigon, Feng System, LUU DAN, OnOn Madé, MORII (tee-focused minimal).

**Agent/owner task [OPEN]:** for each of 5 candidates record: positioning, price range, navigation, hover/motion patterns, size-guide approach, any recommendation/quiz feature, social proof, load performance. Output a short table in `docs/benchmark.md`. Do not assume features that were not observed.

---

## 12. Claude for Startups — reality check

Per the official program page: anyone building with Claude can join the program, but to qualify for **credits and extras** a company must have received equity funding from an institutional investor, been founded within the last four years, and not previously received Anthropic startup credits. Credits apply to the first-party Claude API via the Claude Console.

Owner status: **no institutional investor yet [USER]** → not currently eligible for credits.

Implications:

- The website is **not** the gating factor; funding is. Do not optimize the roadmap for "eligibility" alone.
- Useful supporting evidence: real traffic/traction (GA4), a genuine Claude integration (quiz rationale), clear usage metrics. Since P8, Claude is the fallback behind Gemini (owner decision P8-1), which is weaker evidence; leaving `GEMINI_API_KEY` unset makes Claude the only provider, with no code change.
- Treat the application as a **post-launch backlog item** (Phase 7) and re-check the official terms at that time.
- Until then, AI usage is pay-as-you-go: keep calls few, short, cached where possible, and capped.

---

## 13. Risks and flagged decisions

| ID   | Risk                             | Detail                                                                                                                                                                                                                                                                            | Mitigation                                                                                                                                                                                                          |
| ---- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-01 | **Misleading scarcity**          | D-07: products that physically exist are shown as "Sold out" to create FOMO. This can mislead customers and may conflict with consumer-protection rules in Vietnam (not legal advice). It also harms trust once discovered, and it is inconsistent with a credible startup story. | Keep `status` data-driven. Prefer truthful framings: "Drop 01 — limited run, waitlist open", "Coming soon", "Pre-order". Do not add fabricated counters or countdowns. Owner to revisit before real selling begins. |
| R-02 | Motion hurts performance/a11y    | Heavy hover media, many animations                                                                                                                                                                                                                                                | Budgets in §10.1, lazy loading, reduced-motion support                                                                                                                                                              |
| R-03 | AI cost / abuse                  | Public endpoint calling an LLM                                                                                                                                                                                                                                                    | Rate limit, spend cap, enum-only input, timeout + fallback                                                                                                                                                          |
| R-04 | Scope creep for a solo dev       | Many tabs, rich motion, AI                                                                                                                                                                                                                                                        | Strict phase gates; cut Journal/Lookbook first                                                                                                                                                                      |
| R-05 | Domain/email timing              | Resend production sending needs a verified domain, which is bought after the site is done                                                                                                                                                                                         | Use test sender to the owner's own address during development; schedule domain purchase before Phase 6 launch                                                                                                       |
| R-06 | Policy text missing              | Returns/shipping/privacy not written                                                                                                                                                                                                                                              | Placeholder pages flagged `TODO(owner)`; launch blocked until real text exists                                                                                                                                      |
| R-07 | React/Next version mismatch      | See §5                                                                                                                                                                                                                                                                            | Decide in Phase 0                                                                                                                                                                                                   |
| R-08 | Funding gate for startup credits | See §12                                                                                                                                                                                                                                                                           | Plan without credits                                                                                                                                                                                                |

---

## 14. Gaps in the original description (now tracked)

Missing or still open: target-customer definition [OPEN], brand story/tone-of-voice [OPEN], logo and palette [OPEN], vibe taxonomy [OPEN], shipping and return terms [OPEN], sizing data [OPEN], product copy in both languages [OPEN], exact count/variants of products [OPEN], social channels/handles [OPEN], GA4 property and Search Console access [OPEN], legal review of privacy/consumer rules [OPEN], budget ceiling for AI API [OPEN].

---

## 15. Non-goals (for now)

Cart, checkout, payments, user accounts, order management, inventory sync, free-text chatbot, blog/Journal, admin CMS, coupon/loyalty features.

---

## 16. Glossary

- **Drop:** a limited release of designs.
- **Waitlist:** email list for notification when an item returns or launches.
- **LeadSink:** interface that stores waitlist/contact submissions (email now, Sheet/Supabase later).
- **Data-access layer:** `lib/catalog`, the only module allowed to read product data.

---

# Part 2 — Delivery Plan

> **Superseded (2026-10-22) [USER]:** Phase order, FE/BE/Owner roles, and phase gating rules now live in [`docs/superpowers/plans/2026-10-22-roadmap.md`](./docs/superpowers/plans/2026-10-22-roadmap.md). The phase content below remains as reference detail; where it conflicts with the roadmap, the roadmap wins.

> **Audience:** AI agents (Claude Code, Codex, Antigravity) and the owner.
> **Read first:** Part 1 above (decisions D-xx, risks R-xx, data model, folder structure).
> **Capacity assumption:** one developer, ~8 h/week → ~10–13 weeks to launch (v2 UI adds scroll-driven and transition work). Re-estimate after Phase 1.
> **UI direction v2 (2026-10-14):** see Part 1 section "UI Direction v2" (D-16 to D-26; O-01 to O-08 are now resolved there). Where this plan conflicts with older text, v2 wins. Hour estimates changed by v2 are [PROPOSED].

---

## Conventions for every phase

- Work in small PRs/commits; each phase ends with a **deployable** build (Vercel preview).
- Every phase lists: **GOAL**, **FE**, **BE**, **Milestone (deliverable)**, **Acceptance**, **Estimate**.
- "BE" means server-side code: route handlers, data layer, integrations, config. Before Phase 2 it may be minimal.
- Each component that fetches/derives data handles **loading / error / empty** states.
- Add React Testing Library tests for new interactive components; add Playwright smoke tests when a flow becomes user-facing.
- When a task depends on an **[OPEN]** item in the brainstorm file, ask the owner (max 3 questions) and proceed with the stated default.
- Do not implement fake urgency (countdowns, fake viewer counts, fake low-stock numbers) — see R-01.

### Definition of Done (all phases)

1. `tsc --noEmit` (strict) and lint pass; no `any` without justification.
2. Unit/component tests pass; relevant Playwright smoke passes.
3. Accessibility: keyboard reachable, visible focus, labels, reduced-motion respected; axe has no serious issues on touched pages.
4. Performance: no regression vs. budgets (LCP < 2.5 s, INP < 200 ms, CLS < 0.1 on mobile profile).
5. Both `/vi` and `/en` render for touched pages; no hard-coded user-facing strings.
6. `docs/decisions.md` updated if a decision changed.

---

## Phase overview

| Phase | Name                                                    | Est. hours | Milestone                                                                              |
| ----- | ------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------- |
| P0    | Foundations & decisions                                 | 6–8        | M0: Repo + CI + preview deploy live                                                    |
| P1    | Design system, shell, i18n, motion tokens               | 14–18      | M1: Bilingual shell with transparent→fixed header, motion tokens, transition spike     |
| P2    | Catalog, scroll-driven Home, Shop, Product detail       | 18–24      | M2: Pinned hero, draggable product block, lifestyle reveal, card→PDP transition, /shop |
| P3    | Contact form (merged waitlist), policies, consent + GA4 | 10–13      | M3: Working contact form, consent banner, tracked events                               |
| P4    | Quiz bot v1 (deterministic)                             | 10–14      | M4: Corner launcher + bubble + small-card quiz returns real catalog matches            |
| P5    | Claude rationale + guardrails                           | 6–9        | M5: AI blurbs live with cap, rate limit, fallback                                      |
| P6    | SEO, performance, a11y hardening, launch                | 12–16      | M6: Public launch on production domain                                                 |
| P7    | Post-launch growth backlog                              | ongoing    | M7+: socials, lead sinks, free-text bot, startup application                           |

---

## P0 — Foundations & decisions

**GOAL:** Remove ambiguity and have a working, deployed skeleton.

**FE**

- Scaffold Next.js (App Router) + TypeScript strict + Tailwind; configure ESLint/Prettier.
- Create base layout shell and a placeholder home page.
- Set up Vitest + RTL and a Playwright smoke test (home loads).

**BE**

- Create `lib/env.ts` (Zod-validated env) and `.env.example` (keys: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `RESEND_API_KEY`, `LEADS_TO_EMAIL`, `NEXT_PUBLIC_GA_ID`, `RATE_LIMIT_*`).
- CI (typecheck, lint, test) and Vercel preview deployments.
- Write `docs/decisions.md` seeded from brainstorm §3; record the React/Next version choice (R-07).

**Milestone M0:** repo, CI, preview URL, `docs/` containing both planning files.

**Acceptance:** CI green; preview deploy reachable; decisions file exists.

**Open items to resolve here:** React/Next version; brand palette/typography draft; confirm `next-intl` choice.

---

## P1 — Design system, shell, i18n, motion tokens

**GOAL:** A distinctive, bilingual, accessible shell that all later pages reuse.

**FE**

- Design tokens (CSS variables): white canvas, ink colors, spacing, type scale; swap-friendly (A-04).
- `components/motion/tokens.ts` (durations, easings, stagger) + `Reveal` / `Stagger` primitives honoring `prefers-reduced-motion`.
- Header with nav (Shop, About, Contact, Policy; room for Drops/FAQ), `LocaleSwitcher`, Footer. v2: header is **transparent over the hero, then a fixed bar after the hero** (D-25); verify text contrast in both states.
- UI primitives: Button, Input, Dialog (accessible), Skeleton.
- Page-transition/scroll choreography kept lightweight (transform/opacity only).
- v2 spike: shared-element transition (product image → PDP) via View Transitions API or `motion` `layoutId`; record the chosen approach and the fallback (simple fade) in `docs/decisions.md` (D-20, O-06).
- Tests: LocaleSwitcher, Dialog focus trap, Reveal reduced-motion behavior.

**BE**

- i18n routing: `/vi`, `/en`, default `vi`, redirect from `/`; `messages/vi.json`, `messages/en.json`.
- Metadata base (`generateMetadata` helper), `robots.ts`, minimal `sitemap.ts`.

**Milestone M1:** navigable bilingual shell (empty pages) with consistent motion language.

**Acceptance:** locale switch preserves path; keyboard navigation works; Lighthouse a11y ≥ 95 on shell; no CLS from fonts (use `next/font`); header transparent→fixed switch works without layout shift; transition spike has a documented decision.

---

## P2 — Catalog, Shop, Product detail

**GOAL:** Real products visible, filterable, and status-aware, with the "creative hover" experience.

**FE**

- `ProductCard` with `StatusBadge`; lifestyle-photo **cut/clip reveal** on hover/focus (D-19); touch: first tap previews, second tap opens (D-19a); video slot ready for later; uses a `LifestylePlaceholder` component until real photos exist (O-08): variants `loading`, `missing`, `placeholder-art`, `ready`, each exercising the same clip-reveal animation so timing can be tuned; swap to real photos by data only.
- `/shop` page: `ProductGrid` full grid with filter bar (color, status; vibe filter hidden until taxonomy exists); loading/error/empty states (D-26; layout per O-02).
- Product detail page `/shop/[slug]`: gallery, price (VND formatted per locale), status, CTA that **links to Contact with product pre-filled** (brainstorm §6.2, D-21), size/material info if available; shared-element image transition from the card (D-20).
- Home: `HeroScroll` (pinned, scroll-driven image changes; fashion-style, no title+button+badge template; 4–5 frames, brand mark only per O-01) → `ProductDragGrid` (2–3 rows; one drag moves the whole block; prev/next buttons + keyboard; shortened version of the catalog) → brand story teaser. Static stacked fallback under `prefers-reduced-motion` (O-07).
- Tests: StatusBadge, CTA-by-status matrix (link target + `purpose` default), filter behavior, empty state, drag-grid keyboard navigation, reduced-motion fallbacks.

**BE**

- `lib/catalog/schema.ts` (Zod) and `data.ts` with the real (<10) products, bilingual copy, images (use `next/image`, fixed dimensions).
- `lib/catalog/index.ts` data-access layer: `listProducts`, `getProductBySlug`, `getFilters`.
- Build-time validation: build fails if data violates the schema.
- Image pipeline checks (sizes, formats, alt text in both languages).

**Milestone M2:** `/vi|/en` Home (pinned hero + draggable product block), `/shop`, and `/shop/[slug]` live with statuses, lifestyle reveal and card→PDP transition.

**Acceptance:** all products validate; statuses render the correct CTAs; hover content lazy-loads; no layout shift on hover or during the pinned hero; LCP image prioritized on home and PDP; hero and drag block are fully usable by keyboard and with reduced motion; INP stays < 200 ms while dragging.

---

## P3 — Leads, policies, consent + GA4

**GOAL:** Capture interest safely and measure it.

**FE**

- **Single Contact page form** (D-22): product pre-filled from query string, `purpose` selector (order / notify / other; default from status per D-22a), email, name, message; accessible errors, success state. No inline waitlist form on the PDP.
- Cookie consent banner (accept / reject / manage) with persisted choice; GA4 loads only after consent.
- Policy pages (`privacy`, `returns`) rendered from `content/policies/*` (MDX or TS) — placeholder text flagged `TODO(owner)`.
- Event wiring: `contact_start`, `contact_submit` (param `purpose`), `select_item`, `hover_preview_open`, `locale_switch`.
- Tests: form validation, consent gating (GA script absent before consent), success/error states.

**BE**

- `POST /api/contact` (waitlist merged; `purpose` enum `order | notify | other`): Zod validation, honeypot field, rate limit, consent flag stored with the lead.
- `lib/leads/sink.ts` interface; `email.ts` implementation via Resend (owner notification). Use a test sender until the domain exists (R-05).
- `lib/analytics/consent.ts` + `events.ts` (typed event helpers; no PII in params).
- Stubs for future `sheet.ts` / `supabase.ts` sinks (not implemented).

**Milestone M3:** forms send real emails to the owner; consent banner and GA4 events verified in GA4 DebugView.

**Acceptance:** no GA requests before consent; spam protection active; rate limit tested; privacy page lists email collection, GA4, and AI processing.

**Owner tasks:** provide real policy text; create GA4 property.

---

## P4 — Quiz bot v1 (deterministic)

**GOAL:** Ship the popup quiz that recommends real products — no LLM yet.

**FE**

- `QuizLauncher` (always-visible corner button) → `QuizPopup` as a **small card**: accessible, keyboard-friendly, mobile-friendly, animated in the shared motion language (D-23).
- `QuizBubble`: proactive speech bubble repeating every 30–60 s with a dismiss button (D-24). [PROPOSED] guardrails (D-24a): cap per session (default 3), silent after dismissal, hidden under `prefers-reduced-motion`, not shown while the card is open or on Contact/Policy pages; shown on all other pages (O-04).
- Steps: color (from catalog), vibe (from catalog tags; auto-skip if < 2 distinct vibes), result view with **one featured `ProductCard`** (status-aware CTA) plus a "see more" button linking to `/shop` pre-filtered (O-03).
- States: loading, error (with retry), empty (no match → show nearest match + Contact CTA).
- Events: `quiz_open`, `quiz_step`, `quiz_complete`, `quiz_result_click`, `quiz_bubble_shown`, `quiz_bubble_dismiss`.
- Tests: step navigation, skip logic, empty result, focus management.

**BE**

- `lib/recommend/score.ts`: deterministic scoring (color match weight, vibe overlap weight, status tie-breakers); pure function with unit tests.
- `POST /api/quiz/recommend`: Zod enum validation, returns ranked product ids/slugs; rate limited. (May also be called as a pure function client-side if no server need — prefer server for consistency with P5.)

**Milestone M4:** quiz works end-to-end on production-like preview.

**Acceptance:** scoring unit tests cover ties and no-match; popup does not hurt LCP/INP (lazy-load the quiz bundle); screen reader can complete the quiz.

---

## P5 — Claude rationale + guardrails

**GOAL:** Add a real Claude integration that is cheap, safe, and optional.

**FE**

- Result cards show a short rationale (skeleton while loading); if it fails or times out (~4 s) show results without it — no error banner needed.
- Subtle "AI-generated suggestion" disclosure text (localized).
- Tests: loading → success, timeout fallback.

**BE**

- `POST /api/quiz/explain`: input = product ids + the user's enum answers + locale; prompt includes only catalog facts; output ≤ 2 sentences in the requested locale; structured output validated with Zod.
- Anthropic client on the server with `ANTHROPIC_MODEL` from env; timeout and one retry max.
- Rate limiting per IP; request-size cap; response cache keyed by (product ids, answers, locale) to reduce cost.
- Console-side monthly spend cap configured by the owner; log token usage (no PII).
- Prompt-injection posture: user input is enum-only in v1; never echo free text.

**Milestone M5:** rationale blurbs live with fallback and cost controls.

**Acceptance:** no API key in client bundle; cache hit path verified; abuse test (burst requests) is throttled; quiz still works when the API is disabled via env flag.

---

## P6 — SEO, performance, a11y hardening, launch

**GOAL:** Production-ready, indexable, fast, accessible.

**FE**

- Performance pass: image sizes/priorities, font loading, bundle analysis, lazy hover media, defer quiz bundle, motion audit (transform/opacity only).
- Accessibility pass: axe on all pages, keyboard-only walkthrough, contrast check, reduced-motion QA (pinned hero → static stack; drag block → buttons/native scroll; bubble stops).
- Social preview images; favicon/manifest; 404 and error pages with brand tone.
- Cross-browser/mobile QA (iOS Safari, Android Chrome).

**BE**

- Complete SEO: per-locale metadata, canonical + `hreflang` (+ `x-default`), multilingual sitemap, robots, JSON-LD (`Organization`, `Product` with `availability` from `status`, `BreadcrumbList`).
- Security headers (CSP compatible with GA4/Resend flows), HTTPS-only, basic abuse protections reviewed.
- Domain purchase and DNS; verify sending domain in Resend; workspace mailbox; switch `LEADS_TO_EMAIL`.
- Google Search Console + sitemap submission; GA4 production property.
- Legal/policy final text in place (R-06); owner reviews R-01 decision before real sales.

**Milestone M6:** production launch on the real domain.

**Acceptance:** Lighthouse (mobile) Performance ≥ 90, SEO ≥ 95, A11y ≥ 95 on Home/Shop/PDP; rich-result test passes for Product; all policy pages contain final text; Playwright smoke suite green on production.

---

## P7 — Post-launch backlog (prioritize by GA4 data)

| Item                     | FE                                           | BE                                                                                | GOAL                                                                                                                                   |
| ------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Social channels          | Footer/contact links, share buttons          | Update `sameAs` in JSON-LD                                                        | Fanpage / Instagram / Zalo presence                                                                                                    |
| Persist leads            | —                                            | Implement `sheet.ts` or `supabase.ts` sink behind `LeadSink`                      | Durable lead storage and export                                                                                                        |
| Vibe taxonomy            | Enable vibe filter + quiz step               | Finalize tag schema and migrate data                                              | Better recommendations                                                                                                                 |
| Hover video              | Video hover previews with poster + lazy load | Media hosting/CDN                                                                 | Richer motion                                                                                                                          |
| Drops / Size guide / FAQ | New pages and nav entries                    | Content data models                                                               | SEO + fewer support questions                                                                                                          |
| Journal                  | List/detail pages                            | MDX content pipeline                                                              | Organic traffic                                                                                                                        |
| Free-text bot v2         | Chat UI in popup                             | Claude tool use → structured filters → deterministic ranking; stricter guardrails | Conversational discovery                                                                                                               |
| Checkout readiness       | Cart UI, order flow                          | Migrate catalog to Supabase, payments integration, inventory                      | Real online sales                                                                                                                      |
| Claude for Startups      | —                                            | Collect traction + usage metrics                                                  | Apply when eligibility conditions are met (institutional funding, founded ≤ 4 years, no prior credits) — re-check official terms first |

---

## Cross-cutting checklist (review at each milestone)

- [ ] Data only read through `lib/catalog`.
- [ ] All new strings exist in both `vi.json` and `en.json`.
- [ ] No console errors; no hydration warnings.
- [ ] Events fire only after consent and carry no PII.
- [ ] Motion uses shared tokens; reduced-motion verified.
- [ ] Every scroll-driven, drag or hover interaction has keyboard, touch and reduced-motion alternatives (v2).
- [ ] No fabricated urgency elements.
- [ ] `docs/decisions.md` reflects reality.

## Owner manual tasks (cannot be done by agents)

| Task                                                              | Needed by                 | Notes                                                                                                            |
| ----------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Provide/shoot a lifestyle (model-wearing) photo for every product | Before P2 acceptance / P6 | Until then the `LifestylePlaceholder` is used (O-08). Keep consistent crop/ratio and name files by product slug. |
| Provide 4–5 hero frames in scroll order, plus logo/brand mark     | P2                        | Hero text = brand mark only (O-01).                                                                              |
| Final product list, VI/EN copy, prices, alt text for all images   | P2                        | Catalog data in `lib/catalog/data.ts`.                                                                           |
| Write the About paragraph (VI/EN) and pick one photo              | P2/P3                     | About is minimal (O-05).                                                                                         |
| Real privacy and returns policy text                              | P3, P6                    | Placeholder text is flagged `TODO(owner)`.                                                                       |
| Quiz and bubble copy (VI/EN)                                      | P4                        | Bubble capped at 3/session by default.                                                                           |
| Decide the vibe taxonomy                                          | P4 vibe step, P7          | Vibe step auto-skips until ≥ 2 vibes exist.                                                                      |
| Create GA4 property                                               | P3                        |                                                                                                                  |
| Anthropic API key and monthly spend cap                           | P5                        |                                                                                                                  |
| Buy domain, set up workspace mailbox, verify Resend sender        | P6                        |                                                                                                                  |
| Decide "Sold out" framing before real sales (R-01)                | P6/P7                     |                                                                                                                  |

## Open owner inputs (blockers by phase)

| Needed input                                                                                       | Blocks           |
| -------------------------------------------------------------------------------------------------- | ---------------- |
| React/Next version choice                                                                          | P0               |
| Logo, palette, typography direction                                                                | P1               |
| Final product list, bilingual copy, image files, prices                                            | P2               |
| GA4 property; real privacy/returns text                                                            | P3, P6           |
| Hero storyboard (frames, photos, order, text) and a lifestyle photo for every product (O-01, O-08) | P2               |
| `/shop` layout decision, About/Policy/Footer UI direction (O-02, O-05)                             | P2, P3           |
| Bubble and quiz copy (O-03, O-04)                                                                  | P4               |
| Vibe taxonomy (can wait)                                                                           | P4 vibe step, P7 |
| Anthropic API key and monthly spend cap                                                            | P5               |
| Domain purchase and mailbox                                                                        | P6               |
| Decision on "Sold out" framing before real sales (R-01)                                            | P6 / P7          |
