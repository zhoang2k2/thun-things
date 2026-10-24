# Thun Things Project Bootstrap Implementation Plan

> **Superseded (2026-10-22)** by [`2026-10-22-p0-foundations.md`](./2026-10-22-p0-foundations.md). Kept for history.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize a clean, maintainable, production-ready development environment and AI agent foundation for Thun Things without implementing product features.

**Architecture:** Single Next.js application using modular monolith with root-based App Router (no `src/` directory). Standard framework defaults, TypeScript strict mode, Tailwind CSS v4 with CSS variables, Zod environment validation, Vitest + RTL testing suite, and tool-agnostic AI agent conventions.

**Tech Stack:** Next.js 16.4.0, React 19.3.0, TypeScript 5.x, Tailwind CSS 4.x, pnpm 10.28.0, Zod 3.x, next-intl 4.x, Vitest, React Testing Library, ESLint 9 (flat config), Prettier 3.x, GitHub Actions.

**Spec:** `thun-things.md`

## Global Constraints

- Root-based Next.js App Router structure: `app/`, `components/`, `lib/`, `config/`, `styles/`, `types/` directly at project root.
- Do NOT create or use a `src/` directory.
- Configure `@/*` to resolve to `./*`.
- Strict TypeScript mode enabled; no unjustified `any`.
- Keep source code, identifiers, comments, and technical documentation in English.
- Communicate with the owner in Vietnamese.
- Minimal framework smoke-test page only. No product features, shop grid, quiz bot, or marketing layout.
- No external paid services or credentials provisioned.

## Review Focus

1. **Path alias resolution:** Imports like `@/lib/env` must resolve to `./lib/env` seamlessly in Next.js, TypeScript compiler, and Vitest.
2. **Environment validation resilience:** The application must start cleanly in development/CI without external credentials (Anthropic, Resend, GA4) while documenting future schema.
3. **Strict TypeScript & Lint pass:** All type checks (`tsc --noEmit`) and lint checks must pass with zero warnings or errors on standard configurations.
4. **Agent configuration discovery:** Project skills must be recognized by Antigravity (`.agents/skills`) and Claude Code (`.claude/skills`).
5. **Clean CI pipeline:** GitHub Actions workflow must pass pnpm installation, typecheck, lint, test, and production build without external secrets.

---

### Task 1: Initialize Next.js Project Baseline

**Files:**

- Create/Initialize: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Ensure: `thun-things.md` is preserved at root

**Interfaces:**

- Produces: Working Next.js 16 root-based application with App Router

- [ ] **Step 1:** Initialize Next.js using `pnpm dlx create-next-app@latest .` with `--ts --tailwind --eslint --app --import-alias "@/*" --use-pnpm --empty --no-src-dir` while preserving `thun-things.md`.
- [ ] **Step 2:** Verify package.json contains Next.js 16.4.0, React 19.3.0, Tailwind CSS 4.
- [ ] **Step 3:** Verify tsconfig.json has `@/*` mapped to `["./*"]` and `strict: true`.

---

### Task 2: Configure Code Formatting, Linting & Editor Standards

**Files:**

- Create/Modify: `.prettierrc`, `.prettierignore`, `.editorconfig`, `eslint.config.mjs`
- Modify: `package.json`

**Interfaces:**

- Produces: Standardized code formatting and linting scripts (`pnpm lint`, `pnpm format`, `pnpm format:check`)

- [ ] **Step 1:** Install `prettier` and `prettier-plugin-tailwindcss` as devDependencies.
- [ ] **Step 2:** Create `.prettierrc` with single quotes, trailing commas, semi-colons, and Tailwind plugin.
- [ ] **Step 3:** Create `.editorconfig` with standard Unix line endings, UTF-8, 2 spaces indent.
- [ ] **Step 4:** Add `format` and `format:check` scripts to `package.json`.
- [ ] **Step 5:** Run `pnpm format:check` and `pnpm lint` to verify.

---

### Task 3: Setup Environment Configuration and Security Boundaries

**Files:**

- Create: `lib/env.ts`, `.env.example`, `.env.local`
- Modify: `.gitignore`

**Interfaces:**

- Produces: `env` validated object exported from `lib/env.ts`

- [ ] **Step 1:** Install `zod` and `next-intl` dependencies.
- [ ] **Step 2:** Write `lib/env.ts` with Zod schema defining server-only variables (Anthropic, Resend, Rate limits) and public variables (`NEXT_PUBLIC_GA_ID`), allowing safe fallback/optional defaults for development and build.
- [ ] **Step 3:** Create `.env.example` documenting all configuration keys.
- [ ] **Step 4:** Ensure `.env.local` is present in `.gitignore`.

---

### Task 4: Configure Testing Suite (Vitest + React Testing Library)

**Files:**

- Create: `vitest.config.ts`, `vitest.setup.ts`, `app/page.test.tsx`
- Modify: `package.json`

**Interfaces:**

- Produces: Working `pnpm test` script executing Vitest with DOM environment

- [ ] **Step 1:** Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, `jsdom` as devDependencies.
- [ ] **Step 2:** Configure `vitest.config.ts` with React plugin, jsdom environment, path aliases `@/*` -> `./*`, and setup file.
- [ ] **Step 3:** Create `vitest.setup.ts` importing `@testing-library/jest-dom/vitest`.
- [ ] **Step 4:** Create minimal smoke test in `app/page.test.tsx` verifying page renders without crash.
- [ ] **Step 5:** Run `pnpm test` to verify passing test.

---

### Task 5: AI Agent Configuration and Reusable Skills

**Files:**

- Create: `AGENTS.md`, `CLAUDE.md`
- Create: `.agents/skills/architecture-guidelines/SKILL.md`
- Create: `.agents/skills/frontend-standards/SKILL.md`
- Create: `.agents/skills/motion-guidelines/SKILL.md`
- Create: `.agents/skills/i18n-seo-guidelines/SKILL.md`
- Create: `.agents/skills/testing-quality/SKILL.md`
- Create: `.agents/skills/security-guidelines/SKILL.md`
- Create: `.agents/skills/implementation-workflow/SKILL.md`
- Create symlinks or reference adapters in `.claude/skills/`

**Interfaces:**

- Produces: Project-level agent governance and 7 required skills

- [ ] **Step 1:** Create `AGENTS.md` containing canonical rules, decision hierarchy, and technology baseline.
- [ ] **Step 2:** Create `CLAUDE.md` referencing `AGENTS.md` with Claude Code specific commands.
- [ ] **Step 3:** Author the 7 required project skills in `.agents/skills/`.
- [ ] **Step 4:** Link or adapt skills in `.claude/skills/` to avoid duplication.

---

### Task 6: Architectural Documentation

**Files:**

- Create: `docs/architecture/overview.md`
- Create: `docs/architecture/tech-stack.md`
- Create: `docs/decisions/README.md`
- Create: `docs/agent-guides/workflow.md`
- Create: `README.md`

**Interfaces:**

- Produces: Comprehensive technical documentation referenced to `thun-things.md`

- [ ] **Step 1:** Write `docs/architecture/overview.md` (modular monolith, directory structure, boundaries).
- [ ] **Step 2:** Write `docs/architecture/tech-stack.md` (installed vs deferred libraries with rationale).
- [ ] **Step 3:** Write `docs/decisions/README.md` (record React 19 / Next.js 16 version decisions, ADR index).
- [ ] **Step 4:** Write `docs/agent-guides/workflow.md` (how AI agents should work with the repo).
- [ ] **Step 5:** Write `README.md` (project overview, quickstart scripts, quality gates).

---

### Task 7: GitHub Actions CI Workflow and Verification

**Files:**

- Create: `.github/workflows/ci.yml`

**Interfaces:**

- Produces: Automated CI workflow verifying pnpm install, typecheck, lint, test, build

- [ ] **Step 1:** Create `.github/workflows/ci.yml` with actions for checkout, pnpm setup, node setup with cache, `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`.
- [ ] **Step 2:** Execute full local verification: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build`.
- [ ] **Step 3:** Commit all bootstrap changes to git.
- [ ] **Step 4:** Prepare Vietnamese final report.
