# P7 Quiz Bot v1 (deterministic) — Design

**Date:** 2026-10-24
**Builds on:** D-10, D-23, D-24, D-24a, O-03, O-04 in `thun-things.md`; [`2026-10-24-p6-consent-ga4-design.md`](./2026-10-24-p6-consent-ga4-design.md) (events, consent bar), [`2026-10-23-p5-i18n-design.md`](./2026-10-23-p5-i18n-design.md) (messages, locales), UI v3 (no `/shop`, DR-1/DR-2)
**Roadmap:** P7 in [`../plans/2026-10-22-roadmap.md`](../plans/2026-10-22-roadmap.md)

## Goal

A corner launcher opens a small quiz card (colour → vibe) that recommends one real catalog product, with up to three more on request; a capped speech bubble invites visitors to try it. No LLM yet; P8 adds a Claude rationale to the same API.

## Owner decisions [USER, 2026-10-24]

| ID   | Decision                                                                                                                                                                                                                                                 |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P7-1 | **"See more" expands inside the card** (up to 3 next matches, each linking to its product page). No `/shop` page and no Home filtering (UI v3 removed `/shop`).                                                                                          |
| P7-2 | **Vibes = the five catalog tags** `art`, `graphic`, `minimal`, `street`, `retro`, labelled vi: Nghệ thuật, Đồ hoạ, Tối giản, Đường phố, Hoài cổ; en: Art, Graphic, Minimal, Street, Retro. A placeholder taxonomy: the owner changes it by editing data. |
| P7-3 | **Scoring on the server** via `POST /api/quiz/recommend` (Zod enums, Upstash rate limit) so P8 extends the same endpoint.                                                                                                                                |
| P7-4 | Design approved as presented (launcher, card, bubble copy and timing, scoring weights, events).                                                                                                                                                          |

## 1. Launcher and card

- `QuizLauncher` (client, tiny, on every page): square ink button bottom-right, text label "Tìm áo hợp bạn" / "Find your shirt", no decorative icon. It sits above the consent bar (`--consent-bar-height`) and above the mobile product order bar.
- `QuizCard` (lazy-loaded on first open with `next/dynamic`, `ssr: false`): a non-modal `role="dialog"` panel anchored above the launcher, ~360px wide on desktop, full width minus 16px gutters on mobile. Focus moves to the card's heading on open; Escape and the close button close it and return focus to the launcher; Tab cycles within the card while open.
- Steps:
  1. **Colour:** a radio group of swatches with visible names (only colours used by at least one product, from `lib/catalog`).
  2. **Vibe:** a radio group of text chips (skipped automatically when the catalog has fewer than two distinct vibes).
  3. **Result:** one featured product (image, name, price, status badge, link to its page) plus a "See more" button revealing up to three more, and "Start over".
- States: loading (fixed-height skeleton, no layout shift), error (message + retry), no match (`match: 'none'` → "No exact match — here is the closest" + Contact link).
- Copy in `messages/{vi,en}.json` under `quiz`, sent to the client in the root subset (it is small); English follows the P5 copy rules.
- Reduced motion: no slide-in; otherwise a short fade with motion tokens.

## 2. Bubble

- `QuizBubble` above the launcher: "Chưa biết chọn mẫu nào? Để mình gợi ý." / "Not sure which design? Let me help." with a close (×) button (Hugeicons, functional, labelled). Clicking the text opens the quiz.
- First shown 20 s after load, then every 45 s; at most 3 times per browser session (`sessionStorage`); silent for the session after dismissal; never while the card is open; never on Contact or Policy pages (or the contact result pages); never under `prefers-reduced-motion`. `aria-live="polite"` so it is announced once per appearance; it never takes focus.

## 3. API and scoring

- `app/api/quiz/recommend/route.ts`: `POST` only (others → 405). Body `{ locale: 'vi' | 'en', color: <catalog colour id>, vibe?: <catalog vibe> }` validated with Zod enums built from the catalog; invalid → 400 `{ error, code: 'VALIDATION_ERROR' }`. Rate limit 30 requests / 10 min per client (Upstash, prefix `thun-things:quiz`; in-memory outside production, like leads) → 429. Response `{ match: 'exact' | 'color' | 'vibe' | 'none', featured: QuizProduct, more: QuizProduct[] }` where `QuizProduct = { slug, name, priceLabel, status, image }` in the requested locale.
- `lib/recommend/score.ts` (pure): `score = 3·colourMatch + 2·vibeMatch + statusBonus`, statusBonus `available`/`limited` +2, `preorder` +1, `coming_soon` 0, `sold_out` −3. Ranking is fully deterministic: score desc, then status rank, then `releasedAt` desc (missing last), then slug asc. `match` describes the featured product. `more` = next three.
- The shared rate-limit factory is extracted from `lib/leads/rateLimit.ts` so leads (5/10 min) and quiz (30/10 min) use one implementation; lead behaviour unchanged.

## 4. Events (via P6 `trackEvent`, consent-gated, no PII)

| Event                 | When                      | Params                                                   |
| --------------------- | ------------------------- | -------------------------------------------------------- |
| `quiz_open`           | card opens                | `source`: `launcher` / `bubble`                          |
| `quiz_step`           | a step is answered        | `step`: `color` / `vibe`, `value` (colour id / vibe tag) |
| `quiz_complete`       | a result is shown         | `color`, `vibe?`, `match`                                |
| `quiz_result_click`   | a result link is followed | `product_id` (slug), `position` (0 = featured)           |
| `quiz_bubble_shown`   | bubble appears            | `count` (1–3)                                            |
| `quiz_bubble_dismiss` | × clicked                 | —                                                        |

## 5. Privacy and security

No free text is accepted or stored; answers are enums and are not tied to identity (§7 of `thun-things.md`). CSP unchanged (same-origin API). Privacy policy: if the owner has answered the GA4 retention question, fill the placeholder.

## Testing

- Unit: scoring (exact, colour-only, vibe-only, none; ties broken by status, date, slug; sold-out last), Zod body schema, route handler (400, 405, 429, 200 shape per locale), rate-limit factory (leads unchanged).
- RTL: steps, vibe auto-skip, see more, start over, focus on open/close, Escape, error + retry, no-match copy; bubble with fake timers (20 s / 45 s, cap 3, dismiss silences, hidden on contact/policy and under reduced motion, not while open).
- E2E (both locales): keyboard-only quiz to a result and into a product page; axe with the card open and with the bubble shown; launcher above consent bar and order bar; events with consent (stubbed gtag) carry no PII.
- Lighthouse: budgets unchanged (the card bundle loads on demand).

## Out of scope

Claude rationale (P8), a `/shop` page, Home filtering, quiz answer storage.
