# P0 Foundations — Design

**Date:** 2026-10-22
**Roadmap:** [`../plans/2026-10-22-roadmap.md`](../plans/2026-10-22-roadmap.md) (P0, rules R1–R4)
**Plan:** [`../plans/2026-10-22-p0-foundations.md`](../plans/2026-10-22-p0-foundations.md)

## Intent

Give every later phase a working, verified codebase so no phase needs to install a library, add tooling, or touch CI again. P0 has **no Owner tasks** [USER]: agents run it end to end, from spec to an open PR into `develop`. The owner only reviews and merges.

## Scope

**In scope (option A, owner-confirmed):**

1. Next.js App Router scaffold at repo root (no `src/`, `@/*` → `./*`), placeholder home page.
2. Every library the roadmap needs, installed with pnpm and pinned exactly; later-phase libraries are installed but not imported.
3. Lint (ESLint flat config), format (Prettier + Tailwind plugin), typecheck, unit/component tests (Vitest + RTL), browser smoke test (Playwright).
4. `lib/env.ts`: Zod schema for all ten variables in `docs/configuration-variables.md`, every one optional or defaulted; `.env.example` documents them.
5. GitHub Actions CI running format check, lint, typecheck, unit tests, build — no secrets.
6. Stack docs and README synced with what is installed.

**Out of scope (moved):** Vercel project connection and preview URL → P1 Owner task. Any product UI, copy module, design tokens → P1.

## Decisions

| Topic             | Decision                                                                                             | Reason                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Versions          | Latest stable at execution time, exact pins via `.npmrc` `save-exact=true`                           | Reproducible installs; floors from `tech-stack.md` |
| Node              | 22 LTS (`engines.node >=22`, CI uses 22)                                                             | Matches local toolchain                            |
| Env parsing       | `parseEnv(source)` pure function + `env` constant; empty string = missing; errors name every bad key | Testable without touching real env (R4)            |
| Server-only guard | `import 'server-only'` in `lib/env.ts`                                                               | Build fails if a client component imports secrets  |
| Playwright in CI  | Not in CI for P0; `pnpm test:e2e` runs locally                                                       | Keeps CI fast and browser-free; added to CI in P4  |
| GSAP              | Not installed                                                                                        | Only if P2 proves `motion` + CSS insufficient      |

## Error handling

- Malformed env value → `parseEnv` throws `Error("Invalid environment: <KEY>: <reason>; ...")` at module load; build and dev stop with a readable message.
- Missing optional value → field is `undefined`; consumers in later phases treat that as "feature disabled".

## Testing

- `app/page.test.tsx`: placeholder heading renders.
- `lib/env.test.ts`: empty env parses with defaults; empty string treated as missing; malformed URL, boolean flag, GA id each throw naming the key.
- `e2e/smoke.spec.ts`: production build serves `/` with the heading.

## Done criteria (P0 gate)

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` pass locally with no `.env.local`.
- CI workflow file present and green on the PR (if the remote is reachable).
- Every manifest package pinned exactly in `package.json`.
- PR open into `develop`; owner merge sets roadmap P0 to `DONE`.
