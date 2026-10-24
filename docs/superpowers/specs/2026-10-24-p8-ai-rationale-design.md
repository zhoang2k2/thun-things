# P8 AI Rationale (Gemini first, Anthropic fallback) — Design

**Date:** 2026-10-24
**Builds on:** D-15, §7 and §7.4 in `thun-things.md`; [`2026-10-24-p7-quiz-bot-design.md`](./2026-10-24-p7-quiz-bot-design.md) (quiz, scoring, rate-limit factory, events)
**Roadmap:** P8 in [`../plans/2026-10-22-roadmap.md`](../plans/2026-10-22-roadmap.md)

## Goal

Under the quiz result, show a 1–2 sentence "why this fits you" written by an LLM. The ranking stays deterministic (P7); the model only explains the featured product it is given. Any failure hides the rationale silently; the quiz never depends on it.

## Owner decisions [USER, 2026-10-24]

| ID   | Decision                                                                                                                                                                                                                                                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P8-1 | **Gemini first, Anthropic as fallback.** With `GEMINI_API_KEY` set, Gemini is called first. If Gemini errors, is rate limited, times out or returns invalid output, Anthropic is tried while time remains (`ANTHROPIC_API_KEY` set). No Gemini key → Anthropic directly. No key → no rationale. Supersedes D-15's "Claude writes". |
| P8-2 | **Cheapest model by default** ("always the cheap one, for speed and testing"). Models come from env vars, never hard-coded in call sites.                                                                                                                                                                                          |
| P8-3 | Design approved as presented (endpoint, fallback chain, cache, disclosure, event).                                                                                                                                                                                                                                                 |

## Model research (2026-10-24, ai.google.dev pricing and deprecations pages)

| Model                   | Input / output per 1M tokens (paid) | Availability                                                          |
| ----------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| `gemini-2.5-flash-lite` | $0.10 / $0.40                       | No shutdown date, but **2.5 access is limited to prior users**        |
| `gemini-3.1-flash-lite` | $0.25 / $1.50                       | Stable; earliest shutdown **2027-05-07** (replacement 3.5 Flash-Lite) |
| `gemini-3.5-flash-lite` | $0.30 / $2.50                       | Stable since 2026-07-21; no shutdown date                             |
| `gemini-3.6-flash`      | $0.75 / $3.75 (doubles 2027-01-01)  | Stable                                                                |

- **Default `GEMINI_MODEL = gemini-3.1-flash-lite`**: the cheapest model a new key can use. One rationale ≈ 400 input + 100 output tokens ≈ **$0.00025** (≈ 4,000 rationales per US$1). Switch to `gemini-3.5-flash-lite` (≈ $0.00037 each) before May 2027 by changing the env var; if the owner's account still has 2.5 access, `gemini-2.5-flash-lite` is cheaper still.
- **Default `ANTHROPIC_MODEL = claude-haiku-5-5`** (cheapest current Claude).
- All Gemini models have a free tier. **Free-tier content may be used by Google to improve its products**; quiz inputs are enums with no personal data, so the free tier is acceptable for local and preview testing, but production should use a key from a billing-enabled project (paid tier: not used for training) with a budget alert in Google Cloud Billing. Anthropic: monthly spend cap in the Console.

## 1. Server

- `POST /api/quiz/explain` (`app/api/quiz/explain/route.ts`), `POST` only. Body `{ locale, color, vibe?, slug }`: strict Zod object with catalog enums (`slug` must be a catalog product). Same 1 KB / non-JSON / invalid → 400 `VALIDATION_ERROR` as P7.
- Responses: `200 { text, provider: 'gemini' | 'anthropic' }` with `Cache-Control: no-store`; `204` when AI is off, no key is set, or every provider failed (the client treats 204 and any error the same: no rationale); `429 RATE_LIMITED`.
- Rate limit 10 requests / 10 min per client via the P7 factory (prefix `thun-things:explain`). The limiter runs before the cache, so cache hits count too (one quiz = one call; keeps the endpoint from being scraped).
- **Prompt** (`lib/ai/prompt.ts`): built only from catalog data for `slug` in `locale` (name, description, colour labels, vibe labels, status) plus the visitor's chosen colour and vibe labels. System instruction: write 1–2 short sentences in the requested language, second person, warm and plain, only about this product, no prices, no links, no claims not in the data, no emoji. Vietnamese and English copy rules from P5 apply.
- **Output check** (`lib/ai/output.ts`): trim; reject when empty, > 280 characters, > 2 sentences, or containing a URL, `@`, or markdown/emoji. Rejected output counts as a provider failure (fallback continues).
- **Providers** (`lib/ai/providers/{gemini,anthropic}.ts`): one interface `generate({ system, prompt, maxOutputTokens, signal }) → Promise<string>`. Gemini via `@google/genai` (`models.generateContent`, `maxOutputTokens: 120`, temperature 0.7); Anthropic via `@anthropic-ai/sdk` (`messages.create`, `max_tokens: 120`). SDK clients are created lazily and only on the server (`server-only`).
- **Chain** (`lib/ai/explain.ts`): `explain(input) → { text, provider } | null`. Providers in order Gemini → Anthropic, skipping any without a key. One overall deadline of **3,500 ms** (`AbortSignal.timeout`); each provider gets the remaining time; no same-provider retry (the roadmap's "one retry" becomes the provider fallback so the 4 s client budget holds). Errors are logged server-side as `{ provider, kind: 'timeout' | 'error' | 'invalid' }` only — never the prompt, output or key.
- **Cache** (`lib/ai/cache.ts`): key `explain:v1:<locale>:<color>:<vibe|->:<slug>:<model>`; value `{ text, provider }`; TTL 7 days. Upstash Redis when configured (same condition as the limiters), in-memory LRU (200 entries) otherwise. Failures are not cached.
- **Env** (`lib/env.ts`, `.env.example`, `docs/configuration-variables.md`): add `GEMINI_API_KEY` (optional), `GEMINI_MODEL` (default `gemini-3.1-flash-lite`); keep `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (default `claude-haiku-5-5`), `AI_ENABLED` (default `false`). Keys are server-only; a test asserts no key name or value reaches client bundles.
- CSP unchanged (the browser only calls the same-origin API).

## 2. Client

- When a result arrives, `useQuiz` fires `POST /api/quiz/explain` for the featured product with a 4,000 ms client `AbortController`. "Start over", close, or a new result aborts the pending call.
- Under the featured product: a two-line skeleton (fixed height, no layout shift, `aria-hidden`), then the text in a `<p>` with a small label "Viết bởi AI" / "Written by AI". On 204, error, abort or timeout the skeleton disappears and nothing else changes. The rationale is inside the card's existing live context; no extra announcement or focus move.
- Reduced motion: no fade.
- Copy in `messages/{vi,en}.json` under `quiz` (`rationaleLabel`).

## 3. Events (P6 `trackEvent`, consent-gated)

| Event                  | When                    | Params                                           |
| ---------------------- | ----------------------- | ------------------------------------------------ |
| `quiz_rationale_shown` | a rationale is rendered | `provider`: `gemini` / `anthropic`, `product_id` |

No text from the model is sent to GA4.

## 4. Privacy and security

- Privacy policy (vi/en): the chosen colour and style and the recommended design are sent to Google (Gemini API) or Anthropic to write a short explanation; nothing that identifies the visitor is sent; providers and their policies linked.
- Inputs are catalog enums only (R-03); no free text reaches a model. Keys never leave the server. Spend controls are the owner's (Google Cloud budget alert, Anthropic Console cap).
- `thun-things.md`: D-15 becomes [USER] "Gemini first, Anthropic fallback (P8-1)"; §7.4 names both providers and their env vars; §12 notes that a fallback-only Claude integration is weaker evidence for Claude for Startups (owner accepted).

## Testing

- Unit: output check (length, sentence count, URL/emoji rejection); prompt builder (locale, only catalog facts, no price); chain with fake providers (Gemini ok; Gemini error → Anthropic; Gemini invalid → Anthropic; Gemini timeout leaves remaining time to Anthropic; only Anthropic key; no keys → null; AI off → null; overall deadline respected); cache (hit, TTL, failures not cached, key includes model); route (405, 400 cases, 204 off/no key/all failed, 200 shape, 429); env defaults.
- RTL: skeleton then text and label; 204 and error hide the skeleton; abort on start over; event with provider; quiz result unchanged when the rationale fails.
- E2E: the server runs with `AI_ENABLED=false` (no real calls in CI): the result renders without a rationale and no request leaves the origin; the rationale UI is covered with `page.route` stubbing `/api/quiz/explain` (200 and 204), axe with the rationale shown.
- Bundle check: no `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `@google/genai` or `@anthropic-ai/sdk` strings in `.next/static`.
- Lighthouse: unchanged (the call happens only after a quiz result).
- Owner smoke test on the Vercel preview with real keys (Gemini only, then Anthropic only, then both with an invalid Gemini key).

## Out of scope

Free-text quiz input and tool use (v2 path in §7), streaming, storing rationales beyond the cache, per-product precomputed blurbs.
