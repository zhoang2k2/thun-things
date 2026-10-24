# P8 — AI Rationale (Gemini first, Anthropic fallback) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A 1–2 sentence LLM rationale under the quiz result, from Gemini with Anthropic as fallback, that disappears silently on any failure.

**Architecture:** `lib/ai/` holds the prompt builder, output check, two provider adapters behind one interface, a deadline-bound fallback chain and a cache; `POST /api/quiz/explain` validates catalog enums, rate limits and calls the chain; `useQuiz` fetches the rationale after a result and `QuizResult` renders skeleton → text.

**Tech Stack:** Next.js 16.4 route handlers, `@google/genai` 2.29.1 (new), `@anthropic-ai/sdk` 1.1.0 (installed), Zod 4, Upstash, Vitest + RTL, Playwright + axe.

**Spec:** [`../specs/2026-10-24-p8-ai-rationale-design.md`](../specs/2026-10-24-p8-ai-rationale-design.md).

**Branch / PR:** `phase/p8-ai-rationale` from `develop` → one PR, evidence via `pnpm evidence`.

## Global Constraints

- Provider order Gemini → Anthropic, skipping providers without a key; `AI_ENABLED=false` or no key → no call at all.
- Overall server deadline 3,500 ms; client abort 4,000 ms; no same-provider retry.
- Defaults: `GEMINI_MODEL=gemini-3.1-flash-lite`, `ANTHROPIC_MODEL=claude-haiku-5-5`; models only from env.
- Output: ≤ 280 characters, ≤ 2 sentences, no URL, `@`, markdown or emoji; `maxOutputTokens`/`max_tokens` 120.
- API: `POST` only; strict Zod `{ locale, color, vibe?, slug }` from the catalog; 10 requests / 10 min (`thun-things:explain`); 200 `{ text, provider }`, 204 no rationale, 400/429 `{ error, code }`.
- Never log or send to GA4 prompt, output or keys; keys and SDKs never in client bundles; tests and CI never call a real provider.
- Keep P4–P7 guarantees: render modes, Lighthouse budgets, axe zero serious, both locales, CSP unchanged, DR-1/DR-2, no layout shift from the skeleton.

## Review Focus

1. **A provider hangs** past the deadline → the chain returns within 3.5 s and the fallback still gets the remaining time. Task 2.
2. **Model returns junk** (English for `vi`, a link, three sentences, empty) → treated as failure, fallback runs, nothing invalid is cached. Task 1/2.
3. **Visitor restarts or closes the quiz** while the rationale is loading → request aborted, no stale text on the next result. Task 4.
4. **AI off on preview / CI** → zero outbound calls, quiz identical to P7. Task 3/5.
5. **Key leakage** through bundles, logs or error bodies. Task 3/5.

---

### Task 1: Env, prompt and output check

**Files:** Modify `lib/env.ts` (+ test), `.env.example`, `docs/configuration-variables.md`; create `lib/ai/prompt.ts`, `lib/ai/output.ts` (+ tests).

**Interfaces:** `env.GEMINI_API_KEY?: string`, `env.GEMINI_MODEL: string`; `buildPrompt({ locale, color, vibe?, slug }): { system: string; prompt: string } | null` (null for unknown slug); `checkOutput(text: string): string | null` (trimmed text or null).

- [x] Tests: env defaults (`gemini-3.1-flash-lite`, `claude-haiku-5-5`, AI off) and blank values; prompt contains product name/description/colour and vibe labels in the requested locale and the language instruction, never the price; output check accepts one or two sentences, rejects empty, > 280 chars, three sentences, URL, `@`, markdown, emoji.
- [x] Commit `[FEATURE] Add AI prompt and output checks`.

### Task 2: Providers, chain and cache

**Files:** Create `lib/ai/providers/types.ts`, `lib/ai/providers/gemini.ts`, `lib/ai/providers/anthropic.ts`, `lib/ai/explain.ts`, `lib/ai/cache.ts` (+ tests); add `@google/genai@2.29.1`.

**Interfaces:** `interface AiProvider { name: 'gemini' | 'anthropic'; generate(input: { system: string; prompt: string; maxOutputTokens: number; signal: AbortSignal }): Promise<string> }`; `explain(input: QuizExplainInput, deps?: { providers?: AiProvider[]; cache?: ExplainCache; now?: () => number }) → Promise<{ text: string; provider: AiProvider['name'] } | null>`; `type ExplainCache = { get(key): Promise<Cached | null>; set(key, value): Promise<void> }`.

- [x] Tests (fake providers, fake timers where needed): Gemini ok → gemini; Gemini throws → anthropic; Gemini invalid output → anthropic; Gemini slower than the deadline → aborted, Anthropic gets the rest; only Anthropic configured; no providers / AI off → null without calls; both fail → null; cache hit skips providers; failures not cached; cache key includes locale, colour, vibe, slug, model; memory cache evicts beyond 200 and expires after 7 days; adapters map SDK calls (mocked SDK modules) with 120 tokens and pass the signal.
- [x] Commit `[FEATURE] Add the Gemini and Anthropic fallback chain`.

### Task 3: Explain endpoint

**Files:** Create `app/api/quiz/explain/route.ts` (+ test), `lib/ai/schema.ts`, `lib/ai/rateLimit.ts`.

**Interfaces:** `quizExplainSchema` (strict `{ locale, color, vibe?, slug }`), `checkExplainRateLimit(key)` (10 / 10 min, `thun-things:explain`).

- [x] Tests: GET 405; 400 for unknown slug/colour/vibe, extra keys, non-JSON, > 1 KB; 204 when `explain` returns null; 200 `{ text, provider }` with `no-store`; 429 after 10; error bodies never include provider messages.
- [x] Commit `[FEATURE] Add the quiz explain endpoint`.

### Task 4: Rationale in the result

**Files:** Modify `components/quiz/useQuiz.ts`, `components/quiz/QuizResult.tsx`, `components/quiz/QuizCard.tsx`, `lib/analytics/events.ts` (+ tests), `messages/{vi,en}.json`.

**Interfaces:** `useQuiz` exposes `rationale: { status: 'idle' | 'loading' | 'shown' | 'hidden'; text?: string; provider?: string }`; event `quiz_rationale_shown: { provider: 'gemini' | 'anthropic'; product_id: string }`.

- [x] RTL: skeleton then text with "Viết bởi AI" / "Written by AI"; 204 and network error hide the skeleton; slower than 4 s → hidden; start over and close abort the request; event fired once with provider and slug; result without rationale identical to P7.
- [x] Commit `[FEATURE] Show the AI rationale under the quiz result`.

### Task 5: Privacy, docs, E2E, PR

- [x] Privacy policy vi/en: AI processing paragraph (spec section 4). `thun-things.md` D-15, §7.4, §12 note; roadmap P8 section renamed and updated.
- [x] E2E: AI off → result without rationale and no request beyond the origin; stubbed `/api/quiz/explain` 200 → text + label, axe clean; stubbed 204 → no skeleton left; bundle scan for key names and SDK strings in `.next/static`.
- [x] `pnpm perf` → `docs/reports/lighthouse-p8-<date>/` within budgets.
- [x] ADR-011 (provider order, deadline, cache, Claude for Startups trade-off) + index row; roadmap P8 → `IN REVIEW`; plan notes.
- [x] Evidence: GIF rationale appearing (stubbed response) vi and en; PNG privacy paragraph vi.
- [x] Full suite, push, PR, `pnpm evidence:publish`, CI.

## P8 Acceptance (gate for P9)

- [x] No key or SDK in the client bundle; quiz works with `AI_ENABLED=false`; burst requests throttled.
- [x] Fallback chain tested for errors, timeouts and invalid output; nothing invalid cached.
- [x] No Lighthouse regression; CI green; evidence in the PR.
- [ ] Owner smoke test on the preview with real keys; owner merged the PR; roadmap P8 = `DONE`.

## Implementation notes (2026-10-24)

- With a fallback configured, the first provider gets at most 2,000 ms of the 3,500 ms deadline; otherwise a hanging Gemini would leave Anthropic no time.
- Gemini thinking is minimised (`thinkingLevel: MINIMAL` on 3.x, `thinkingBudget: 0` on 2.x) so it does not consume the 120-token cap.
- The cache key carries the models of the whole chain, so changing either model starts a fresh cache.
- A throwing chain answers 204 (logged by error name only), never 500.
- JSON body reading moved to `lib/security/jsonBody.ts` and is shared with the recommend endpoint.
- The Playwright, evidence and Lighthouse servers force `AI_ENABLED=false`, so no run reaches a real provider even when the owner's local file has keys.
- Lighthouse (first-visit state, consent bar showing): LCP 2.26–2.41 s, CLS 0, TBT ≤ 27 ms — `docs/reports/lighthouse-p8-2026-10-24/`.
