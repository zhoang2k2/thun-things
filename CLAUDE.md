# Claude Code — Project Entry Point

> **Canonical Instructions:** Read [`AGENTS.md`](./AGENTS.md) before making any code modifications.
> **Source of Truth:** [`thun-things.md`](./thun-things.md)

---

## Quick Reference Commands

```bash
pnpm dev          # Run development server with Turbopack
pnpm build        # Build optimized production bundle
pnpm test         # Run Vitest test suite
pnpm typecheck    # Check TypeScript types (strict mode)
pnpm lint         # Run ESLint check
pnpm format:check # Verify Prettier formatting
pnpm format       # Auto-format codebase
```

---

## Critical Rules for Claude Code

1. **Hierarchy & Source of Truth:** `thun-things.md` is the project source of truth. Respect `[USER]` (binding), `[PROPOSED]`, `[ASSUMPTION]`, and `[OPEN]` tags.
2. **Architecture:** Root-based App Router only. Do NOT create or use `src/`. Path alias `@/*` maps to `./*`.
3. **Components:** Favor React Server Components by default; only use Client Components (`"use client"`) when strictly required for interactivity.
4. **Data Access:** All catalog queries must pass through `lib/catalog/`. Do not bypass the data-access layer.
5. **Languages:**
   - Communicate and report to the owner in **Vietnamese**.
   - Write all code, comments, identifiers, tests, and technical documentation in **English**.
6. **Verification:** Always run `pnpm typecheck`, `pnpm lint`, and `pnpm test` after modifying code before concluding work.
7. **Skills:** Reusable skills for architecture, frontend, motion, i18n/SEO, testing, security, and workflow are available in `.claude/skills/` (mirrored from `.agents/skills/`).
