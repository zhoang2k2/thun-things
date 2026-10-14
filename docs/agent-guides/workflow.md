# AI Agent Workflow Guide

> **Core Instructions:** Read [`AGENTS.md`](../../AGENTS.md) and [`thun-things.md`](../../thun-things.md) before starting any implementation task.

This guide defines how Claude Code, Codex, Antigravity, and peer AI agents collaborate with the owner on the Thun Things codebase.

---

## 1. Operating Rules for Agents

1. **Owner Profile:** The project owner is a solo developer with < 10 hours/week available. Respect their time by producing concise, actionable summaries and self-verifying code before presenting it.
2. **Language Rules:**
   - **User Communication:** All messages, updates, and reports to the owner MUST be written in **Vietnamese**.
   - **Code & Documentation:** All source code, identifiers, comments, tests, commits, and technical docs MUST be written in **English**.
3. **Scope Control:** Never implement an entire future phase (e.g. starting Phase 1 or Phase 2) without explicit, recorded owner instruction.
4. **Preserve Source of Truth:** `thun-things.md` is the project source of truth. Tag items strictly: `[USER]` (binding), `[PROPOSED]`, `[ASSUMPTION]`, and `[OPEN]`.

---

## 2. Standard 6-Step Implementation Cycle

Every AI agent task must follow this disciplined cycle:

```
[1. Intake Requirements]
         ↓
[2. Identify Scope & Blockers]
         ↓
[3. Formulate Minimal Plan]
         ↓
[4. Implement Bite-Sized Changes]
         ↓
[5. Execute Quality Gates (Tests/Lint)]
         ↓
[6. Deliver Vietnamese Report]
```

### Step 1: Intake Requirements

- Read `AGENTS.md` and `thun-things.md`.
- Consult relevant skills in `.agents/skills/`.

### Step 2: Identify Scope & Blockers

- Identify which phase the task belongs to.
- If the task hits an `[OPEN]` item that cannot be resolved safely with a reversible default, ask the owner max 3 targeted questions. Otherwise proceed with the documented default.

### Step 3: Formulate Minimal Plan

- State the goal, touched files, data boundaries, and test strategy.
- Keep changes minimal and isolated.

### Step 4: Implement Bite-Sized Changes

- Follow established conventions: Server Components by default, strict TypeScript, centralized motion tokens, semantic HTML.
- Avoid unjustified dependencies or abstractions.

### Step 5: Execute Quality Gates

Run local verification commands before concluding work:

```bash
pnpm typecheck   # Strict TypeScript checking
pnpm lint        # ESLint Next.js and TypeScript rules
pnpm format:check# Prettier formatting verification
pnpm test        # Vitest test suite execution
pnpm build       # Production build validation
```

### Step 6: Deliver Vietnamese Report

Provide a structured report in Vietnamese summarizing:

- Changes made and files touched.
- Test and build verification outcomes.
- Any manual steps or open decisions for the owner.

---

## 3. Project Skills Reference

When executing specialized tasks, load the relevant skill from `.agents/skills/`:

| Skill                     | Purpose                                         | When to Use                                               |
| ------------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `architecture-guidelines` | App Router rules, modular monolith boundaries   | Creating new routes, moving files, data layer abstraction |
| `frontend-standards`      | React 19, TypeScript strict, accessibility      | Writing UI components, forms, layouts                     |
| `motion-guidelines`       | CSS-first motion, tokens, reduced-motion        | Adding animations, hover effects, transitions             |
| `i18n-seo-guidelines`     | Vietnamese/English routing, metadata, JSON-LD   | Adding pages, localized copy, SEO structured data         |
| `testing-quality`         | Vitest, React Testing Library, regression tests | Writing unit/component tests, fixing bugs                 |
| `security-guidelines`     | Secrets, API boundaries, rate limits, consent   | Handling env vars, creating route handlers, analytics     |
| `implementation-workflow` | End-to-end task execution discipline            | Any coding or refactoring task                            |
