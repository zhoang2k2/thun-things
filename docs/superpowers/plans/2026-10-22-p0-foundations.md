# P0 — Foundations & Full Dependency Install Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A root-based Next.js app with every library the roadmap needs installed with pnpm, quality tooling wired, an env schema that never crashes on missing values, and CI green without secrets.

**Architecture:** Single Next.js App Router app at the repo root (no `src/`, `@/*` → `./*`). Libraries for later phases are installed now but not wired into runtime code; each later phase wires its own. All configuration is read through `lib/env.ts`.

**Tech Stack:** pnpm, Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, Zod 4, Vitest + React Testing Library, Playwright, ESLint 9 flat config, Prettier, GitHub Actions.

**Spec:** [`../specs/2026-10-22-p0-foundations-design.md`](../specs/2026-10-22-p0-foundations-design.md), [`2026-10-22-roadmap.md`](./2026-10-22-roadmap.md) (P0 section, rules R1–R4), [`thun-things.md`](../../../thun-things.md) §5, §8.

**Branch / PR:** `phase/p0-foundations` from `develop` → one PR into `develop`. One commit per task (more if a task naturally splits).

## Global Constraints

- Package manager: pnpm only; commit `pnpm-lock.yaml`; set `"packageManager"` in `package.json` to the installed pnpm version.
- Versions: install the latest stable release of each package at execution time; minimum floors from `docs/architecture/tech-stack.md`: `next@16.4.0`, `react@19.3.0`, `typescript@5.9`, `tailwindcss@4.3`, `zod@4.6`. Pin exact versions (`save-exact=true` in `.npmrc`).
- No `src/` directory. `tsconfig.json` `strict: true`, `paths: { "@/*": ["./*"] }`.
- Agents must not read `.env`, `.env.local`, `.env.*.local` (rule R4).
- No product features in P0: home page is a placeholder.
- Code, comments, commits in English; commit format `[TYPE] Imperative summary`.

## Dependency Manifest

Installed in Task 2. "Wired in" = the phase that first imports it.

| Package | Kind | Wired in | Purpose |
| --- | --- | --- | --- |
| `next`, `react`, `react-dom` | dep | P0 | Framework |
| `zod` | dep | P0 | Env, catalog, API validation |
| `motion` | dep | P1 | Animations, shared-element transition |
| `lucide-react` | dep | P1 | Icons |
| `radix-ui` | dep | P1 | Accessible primitives (Dialog, Popover) |
| `clsx`, `tailwind-merge` | dep | P1 | Class composition |
| `resend` | dep | P3 | Contact email |
| `@upstash/ratelimit`, `@upstash/redis` | dep | P3 | Serverless rate limiting |
| `next-intl` | dep | P5 | i18n routing and messages |
| `@next/third-parties` | dep | P6 | GA4 loader |
| `@anthropic-ai/sdk` | dep | P8 | Claude rationale |
| `typescript`, `@types/node`, `@types/react`, `@types/react-dom` | dev | P0 | Types |
| `tailwindcss`, `@tailwindcss/postcss` | dev | P0 | Styling |
| `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss` | dev | P0 | Lint/format |
| `vitest`, `@vitejs/plugin-react`, `jsdom` | dev | P0 | Unit/component tests |
| `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` | dev | P0 | Component tests |
| `@playwright/test`, `@axe-core/playwright` | dev | P0 / P4 | Smoke + a11y tests |

Not installed: `gsap` (only if `motion` + CSS cannot deliver the pinned hero, decided in P2), Prisma/Supabase, Redux/Zustand (see `tech-stack.md` §3).

## Review Focus

1. **Empty env:** `pnpm dev`, `pnpm build`, and CI run with no env values at all → app starts, no throw. Pinned by Task 4 test `parses an empty environment`.
2. **Malformed env value:** `NEXT_PUBLIC_SITE_URL=not-a-url` or `AI_ENABLED=yes` → schema throws a readable error naming the variable. Pinned by Task 4 tests.
3. **Secret leakage:** a server variable imported into a Client Component → build fails. Pinned by `import 'server-only'` in `lib/env.ts` (Task 4).
4. **Alias drift:** `@/lib/env` resolves in Next, `tsc`, and Vitest alike. Pinned by Task 3 test importing via `@/`.
5. **Lockfile drift in CI:** `pnpm install --frozen-lockfile` fails if `package.json` and lockfile disagree. Pinned by Task 5 CI step.

---

### Task 0 (BE): Branch and docs

P0 has no Owner tasks [USER]. Env deny rules were already narrowed (2026-10-22: `.claude/settings.json` + user-level Bash guard hook).

- [ ] Create `phase/p0-foundations` from `main`.
- [ ] Commit roadmap, this plan, the design spec, `docs/configuration-variables.md`, `.claude/settings.json`: `[DOCS] Add roadmap v2, P0 spec and plan, env access rules`.

### Task 1 (FE): Scaffold Next.js baseline

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.npmrc`
- Modify: `.gitignore` (keep existing entries; add Next/Playwright outputs)
- Preserve: `thun-things.md`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/`, `.agents/`, `.claude/`

**Interfaces:**
- Produces: Next.js app at root; `@/*` alias; scripts `dev`, `build`, `start`.

- [ ] **Step 1:** Scaffold into a temp dir and copy in (create-next-app refuses non-empty dirs): `pnpm dlx create-next-app@latest /tmp/thun-scaffold --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-pnpm --turbopack --empty`, then copy everything except `README.md`, `AGENTS.md`, `CLAUDE.md`, `.git`.
- [ ] **Step 2:** Add `.npmrc` with `save-exact=true`; set `"packageManager": "pnpm@<installed version>"`.
- [ ] **Step 3:** `app/page.tsx` renders `<main><h1>Thun Things</h1></main>`; `app/layout.tsx` sets `<html lang="vi">`.
- [ ] **Step 4:** Read `node_modules/next/dist/docs/` notes for this Next version (AGENTS.md rule); fix any deprecation in generated files.
- [ ] **Step 5:** Run `pnpm build` → Expected: build succeeds.
- [ ] **Step 6:** Commit `[CHORE] Scaffold Next.js App Router baseline`.

### Task 2 (BE): Install all roadmap libraries

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

**Interfaces:**
- Produces: every package in the Dependency Manifest resolvable from `node_modules`.

- [ ] **Step 1:** `pnpm add zod motion lucide-react radix-ui clsx tailwind-merge resend @upstash/ratelimit @upstash/redis next-intl @next/third-parties @anthropic-ai/sdk server-only`
- [ ] **Step 2:** `pnpm add -D prettier prettier-plugin-tailwindcss vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test @axe-core/playwright`
- [ ] **Step 3:** `pnpm exec playwright install chromium`
- [ ] **Step 4:** Check peer warnings: `pnpm install` → Expected: no unmet peer dependency for `react@19`. If a package lacks React 19 support, stop and report to owner.
- [ ] **Step 5:** `pnpm build` → Expected: succeeds (nothing imported yet).
- [ ] **Step 6:** Commit `[CHORE] Install roadmap runtime and tooling dependencies`.

### Task 3 (BE): Lint, format, and test tooling

**Files:**
- Create: `.prettierrc`, `.prettierignore`, `.editorconfig`, `vitest.config.mts`, `vitest.setup.ts`, `playwright.config.ts`, `app/page.test.tsx`, `e2e/smoke.spec.ts`
- Modify: `eslint.config.mjs`, `package.json` (scripts)

**Interfaces:**
- Produces scripts: `lint`, `typecheck` (`tsc --noEmit`), `format`, `format:check`, `test` (`vitest run`), `test:watch`, `test:e2e` (`playwright test`).

- [ ] **Step 1:** Write failing test `app/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import Page from '@/app/page';

it('renders the brand heading', () => {
  render(<Page />);
  expect(screen.getByRole('heading', { level: 1, name: 'Thun Things' })).toBeInTheDocument();
});
```

- [ ] **Step 2:** `pnpm test` → Expected: FAIL (no Vitest config / alias).
- [ ] **Step 3:** `vitest.config.mts`: React plugin, `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`, alias `@` → repo root, exclude `e2e/**`. `vitest.setup.ts` imports `@testing-library/jest-dom/vitest`.
- [ ] **Step 4:** `pnpm test` → Expected: PASS.
- [ ] **Step 5:** `.prettierrc`: `singleQuote: true`, `semi: true`, `trailingComma: "all"`, `printWidth: 100`, plugin `prettier-plugin-tailwindcss`. `.editorconfig`: utf-8, lf, 2 spaces.
- [ ] **Step 6:** `playwright.config.ts`: `testDir: 'e2e'`, chromium only, `webServer: { command: 'pnpm build && pnpm start', port: 3000 }`. `e2e/smoke.spec.ts`: home returns 200 and shows heading "Thun Things".
- [ ] **Step 7:** Run `pnpm format && pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e` → Expected: all pass.
- [ ] **Step 8:** Commit `[CHORE] Configure lint, format, and test tooling`.

### Task 4 (BE): Env schema, example file, and agent guard

**Files:**
- Create: `lib/env.ts`, `lib/env.test.ts`, `.env.example`, `.claude/settings.json`
- Modify: `docs/configuration-variables.md` (only if a variable changes)

**Interfaces:**
- Produces: `export function parseEnv(source: Record<string, string | undefined>): Env`, `export const env: Env` (parsed from `process.env`), `export type Env`.
- `Env` fields exactly as in `docs/configuration-variables.md`: `NEXT_PUBLIC_SITE_URL: string` (default `http://localhost:3000`), `RESEND_API_KEY?`, `LEADS_TO_EMAIL?` (email), `LEADS_FROM_EMAIL: string` (default `onboarding@resend.dev`), `UPSTASH_REDIS_REST_URL?` (url), `UPSTASH_REDIS_REST_TOKEN?`, `NEXT_PUBLIC_GA_ID?` (regex `^G-[A-Z0-9]+$`), `ANTHROPIC_API_KEY?`, `ANTHROPIC_MODEL: string` (default `claude-haiku-5-5`), `AI_ENABLED: boolean` (from `"true" | "false"`, default `false`).
- Empty strings are treated as missing.

- [ ] **Step 1:** Write failing tests in `lib/env.test.ts`:
  - `parses an empty environment` → `parseEnv({})` returns `NEXT_PUBLIC_SITE_URL === 'http://localhost:3000'`, `AI_ENABLED === false`, `RESEND_API_KEY === undefined`.
  - `treats empty strings as missing` → `parseEnv({ RESEND_API_KEY: '' }).RESEND_API_KEY === undefined`.
  - `rejects a malformed site url` → `parseEnv({ NEXT_PUBLIC_SITE_URL: 'not-a-url' })` throws an error whose message contains `NEXT_PUBLIC_SITE_URL`.
  - `rejects a non-boolean AI flag` → `parseEnv({ AI_ENABLED: 'yes' })` throws with `AI_ENABLED`.
  - `rejects a malformed GA id` → `parseEnv({ NEXT_PUBLIC_GA_ID: '123' })` throws with `NEXT_PUBLIC_GA_ID`.
- [ ] **Step 2:** `pnpm test lib/env.test.ts` → Expected: FAIL (module missing).
- [ ] **Step 3:** Implement `lib/env.ts` with Zod; first line `import 'server-only';` (mock `server-only` in `vitest.setup.ts` via `vi.mock('server-only', () => ({}))`). Error message lists each failing variable name.
- [ ] **Step 4:** `pnpm test` → Expected: PASS.
- [ ] **Step 5:** Write `.env.example` with every variable from the table, empty values, one comment line each naming its phase.
- [ ] **Step 6:** Confirm `.claude/settings.json` (already present) still denies Read/Edit of real env files and does not match `.env.example` or `lib/env.ts`; do not loosen it.
- [ ] **Step 7:** `pnpm build` with no `.env.local` → Expected: succeeds.
- [ ] **Step 8:** Commit `[TASK] Add optional-first env schema and env example`.

### Task 5 (BE): CI workflow and docs sync

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `docs/architecture/tech-stack.md`, `README.md`, `docs/superpowers/plans/2026-10-22-roadmap.md` (P0 status)

**Interfaces:**
- Produces: CI job `quality` on push/PR to `develop` and `main`.

- [ ] **Step 1:** `ci.yml`: `pnpm/action-setup` (version from `packageManager`), Node 22 LTS, `pnpm install --frozen-lockfile`, then `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`; no secrets referenced.
- [ ] **Step 2:** Update `tech-stack.md`: section 1 lists every installed package with its resolved exact version and "Wired in" phase; remove "Deferred" rows that are now installed; keep `gsap` as conditional.
- [ ] **Step 3:** Update `README.md` quickstart: `pnpm install`, `cp .env.example .env.local`, `pnpm dev`, quality commands.
- [ ] **Step 4:** Run full suite: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` → Expected: all pass.
- [ ] **Step 5:** Set P0 status to `IN REVIEW` in the roadmap.
- [ ] **Step 6:** Commit `[CHORE] Add CI workflow and sync stack docs`, push branch, open PR `[CHORE] P0 foundations and full dependency install` into `develop` (only when the owner authorizes push/PR).

## P0 Acceptance (gate for P1)

- [ ] CI green on the PR with no secrets configured.
- [ ] `pnpm build` and `pnpm test:e2e` pass with no `.env.local`.
- [ ] Every package in the Dependency Manifest is in `package.json` with an exact version.
- [ ] Owner merged the PR into `develop`; roadmap P0 status = `DONE`.
