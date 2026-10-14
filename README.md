# Thun Things

> Technical foundation for **Thun Things** — a creative, bilingual fashion-brand website featuring minimal aesthetics, synchronized motion, and an AI-assisted product recommendation experience.
>
> **Source of Truth:** For full business strategy, UX concepts, and phased delivery plan, read [`thun-things.md`](./thun-things.md).

---

## 1. Tech Stack Overview

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org) with Turbopack
- **UI & Runtime:** [React 19](https://react.dev)
- **Language:** [TypeScript 5](https://www.typescriptlang.org) (strict mode enabled)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) with CSS variable design tokens
- **Package Manager:** [pnpm](https://pnpm.io)
- **Environment Validation:** [Zod](https://zod.dev)
- **Localization:** [next-intl](https://next-intl-docs.vercel.app) (supporting Vietnamese `/vi` and English `/en`)
- **Testing:** [Vitest](https://vitest.dev) & [React Testing Library](https://testing-library.com)
- **Code Quality:** ESLint 9 & Prettier (with Tailwind CSS class sorting)
- **CI:** GitHub Actions

For detailed dependency rationales and deferred libraries, see [`docs/architecture/tech-stack.md`](./docs/architecture/tech-stack.md).

---

## 2. Getting Started

### Prerequisites

- Node.js >= 20.x (Recommended: Node.js 22 LTS)
- pnpm >= 9.x (Installed: pnpm 10.x)

### Local Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd thun-things

# 2. Install dependencies
pnpm install

# 3. Setup environment variables
cp .env.example .env.local

# 4. Start local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Available Scripts

| Command             | Purpose                                                    |
| ------------------- | ---------------------------------------------------------- |
| `pnpm dev`          | Starts the Next.js development server with Turbopack       |
| `pnpm build`        | Compiles an optimized production build                     |
| `pnpm start`        | Runs the compiled production server                        |
| `pnpm typecheck`    | Validates TypeScript types in strict mode (`tsc --noEmit`) |
| `pnpm lint`         | Runs ESLint checks with Next.js and TypeScript rules       |
| `pnpm test`         | Runs the Vitest test suite                                 |
| `pnpm format`       | Formats all code files using Prettier                      |
| `pnpm format:check` | Checks code formatting without modifying files             |

---

## 4. Architecture & Conventions

- **Modular Monolith:** Single repository without monorepo overhead, optimized for a solo developer.
- **Root-Based App Router:** Application files live directly in `app/`, `components/`, `lib/`, `config/`, `styles/`, and `types/` at the root. No `src/` directory.
- **Path Alias:** `@/*` resolves directly to `./*`.
- **Data Access Layer:** All product data is queried strictly via `lib/catalog/index.ts`.
- **Secrets & Security:** Server-only secrets are never exposed to client bundles. All environment variables are validated via `lib/env.ts`.

Read [`docs/architecture/overview.md`](./docs/architecture/overview.md) and [`docs/decisions/README.md`](./docs/decisions/README.md) for full architectural guidelines.

---

## 5. Working with AI Coding Agents

This codebase is maintained with assistance from Claude Code, Codex, and Antigravity.

- **Canonical Instructions:** [`AGENTS.md`](./AGENTS.md)
- **Claude Code Entry Point:** [`CLAUDE.md`](./CLAUDE.md)
- **Agent Workflow:** [`docs/agent-guides/workflow.md`](./docs/agent-guides/workflow.md)
- **Reusable Project Skills:** Located in `.agents/skills/` (and `.claude/skills/`).

### Primary Rules for Agents

1. Read `AGENTS.md` and `thun-things.md` before making changes.
2. Implement only the explicitly requested scope; do not start future phases prematurely.
3. Always run `pnpm typecheck`, `pnpm lint`, and `pnpm test` after modifying code.
4. Keep technical artifacts in English; communicate with the owner in Vietnamese.
