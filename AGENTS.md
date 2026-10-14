<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Thun Things — Canonical AI Agent Instructions

> **Audience:** Claude Code, Codex, Antigravity, and any AI coding assistants working in this repository.
> **Source of Truth:** [`thun-things.md`](./thun-things.md)
> **Owner Profile:** Solo developer, < 10 hours/week available.

---

## 1. Core Principles & Decision Hierarchy

1. **Source of Truth:** `thun-things.md` is the single source of truth for product strategy, UX, data models, and delivery phases.
2. **Decision Tagging Hierarchy:**
   - **`[USER]`**: Decisions confirmed by the owner (binding authority).
   - **`[PROPOSED]`**: Agent recommendations awaiting user confirmation.
   - **`[ASSUMPTION]`**: Unverified assumptions to validate.
   - **`[OPEN]`**: Unresolved items (ask owner max 3 targeted questions, or proceed with safe reversible defaults).
3. **No Over-Implementation:** Implement ONLY the explicitly requested scope. Never build ahead or start future phases without explicit authorization.
4. **Preserve Integrity:** Never silently alter architectural decisions, data schemas, or product guardrails.

---

## 2. 15 Required Agent Rules

All AI agents operating on this codebase must strictly observe these rules:

1. **Read before editing:** Always read `AGENTS.md` and relevant project documentation before proposing or modifying files.
2. **Follow `thun-things.md`:** Respect its decision hierarchy and constraints in every task.
3. **Respect decision tags:** Maintain the clear distinction between confirmed decisions, proposals, assumptions, and open questions.
4. **Strict scope enforcement:** Implement only what was explicitly requested for the current task or phase.
5. **Simplicity over complexity:** Prefer small, understandable, incremental changes over clever abstractions or premature generalizations.
6. **Strict TypeScript:** Keep TypeScript strict mode enabled (`tsc --noEmit`). Avoid unjustified `any` or loose casts.
7. **Server Components first:** Favor React Server Components (RSC) by default. Use Client Components (`"use client"`) only for user interaction, event listeners, or client-side hooks.
8. **Minimal dependencies:** Avoid adding new packages or abstractions without documented justification and explicit user consent.
9. **Accessibility, SEO, and Performance:** Preserve WCAG 2.2 AA targets, semantic HTML, `prefers-reduced-motion` fallbacks, Core Web Vitals budgets (LCP < 2.5s, INP < 200ms, CLS < 0.1), and zero layout shifts.
10. **English for technical artifacts:** Keep all source code, variable/function identifiers, comments, commit messages, and technical documentation in English.
11. **Vietnamese with the owner:** Communicate, explain, and report to the repository owner in Vietnamese.
12. **Phase boundaries:** Never implement an entire future phase without explicit authorization.
13. **Architectural consistency:** Never silently change architectural decisions (e.g. root folder structure, data access boundaries).
14. **Verify after change:** Run appropriate quality checks (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm format:check`) after modifying code.
15. **Security first:** Never expose secrets, API keys, or credentials to the client bundle or commit them to Git.

---

## 3. Project Architecture & Conventions

### Directory Layout (Root-Based App Router)

- **NO `src/` directory.** Do not create or move files into a `src/` folder.
- Root folders:
  - `app/`: Next.js App Router routes, layouts, and route handlers.
  - `components/`: UI components categorized by feature (`ui/`, `layout/`, `shop/`, `home/`, `quiz/`, `motion/`).
  - `lib/`: Business logic, environment validation (`env.ts`), data access (`catalog/`), analytics, recommendations.
  - `config/`: Application configuration and constants.
  - `styles/`: Additional styling definitions if needed.
  - `types/`: Global and shared TypeScript definitions.
  - `docs/`: Technical documentation and decision records.
  - `.agents/skills/`: Canonical project skills for AI pair programmers.
- **Path Alias:** `@/*` maps directly to `./*` from the project root.

### Data Boundaries

- Product catalog data must **only** be accessed via the data-access layer (`lib/catalog/index.ts`).
- Route handlers and UI components must never query raw data sources directly.

### Environment & Secrets

- All environment access must go through `@/lib/env`.
- Variables prefixed with `NEXT_PUBLIC_` are bundled to the browser.
- All non-prefixed variables are strictly server-only.

---

## 4. Reusable Project Skills

The repository contains specialized project skills in `.agents/skills/` (and mirrored for Claude in `.claude/skills/`):

1. **`architecture-guidelines`**: Next.js App Router conventions, server/client boundaries, modular monolith organization, data-access patterns.
2. **`frontend-standards`**: React 19 and TypeScript conventions, semantic HTML, accessible component composition, bundle minimization.
3. **`motion-guidelines`**: CSS-first animations, Motion conventions, GSAP escalation criteria, reduced-motion fallbacks, frame budgets.
4. **`i18n-seo-guidelines`**: Vietnamese/English conventions, locale routing (`/vi`, `/en`), metadata, JSON-LD, hreflang, multilingual SEO.
5. **`testing-quality`**: Vitest, React Testing Library, testing conventions, smoke testing, accessibility testing, regression prevention.
6. **`security-guidelines`**: Secret isolation, server-side API boundaries, Zod validation, rate limiting, privacy and consent (GDPR / Decree 13).
7. **`implementation-workflow`**: Step-by-step discipline: requirement check, scope identification, planning, minimal change, validation, reporting.

---

## 5. Standard Quality Commands

Always execute the relevant validation scripts before finishing a task:

```bash
# Typecheck TypeScript
pnpm typecheck

# Lint with Next.js & TypeScript rules
pnpm lint

# Check code formatting with Prettier
pnpm format:check

# Auto-format files
pnpm format

# Run unit and component test suite
pnpm test

# Production build verification
pnpm build
```
