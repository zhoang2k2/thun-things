# Technology Stack & Dependency Decisions

> **Reference:** For product constraints and delivery milestones, refer to [`thun-things.md`](../../thun-things.md).

---

## 1. Installed Dependencies (P0)

All packages are installed in P0 and pinned to exact versions (`.npmrc` `save-exact=true`). "Wired in" is the roadmap phase that first imports the package; until then it is installed but unused.

### Runtime

| Package                                | Version       | Wired in | Purpose                                                          |
| -------------------------------------- | ------------- | -------- | ---------------------------------------------------------------- |
| `next`                                 | 16.4.2        | P0       | App Router framework, Turbopack, route handlers                  |
| `react`, `react-dom`                   | 19.3.0        | P0       | UI runtime                                                       |
| `zod`                                  | 4.6.7         | P0       | Env (`lib/env.ts`), catalog, API validation                      |
| `server-only`                          | 0.0.1         | P0       | Build-time guard against importing server modules in client code |
| `motion`                               | 14.6.0        | P1       | Animations, shared-element transitions                           |
| `lucide-react`                         | 1.61.0        | P1       | Icons                                                            |
| `radix-ui`                             | 1.8.1         | P1       | Accessible primitives (Dialog, Popover)                          |
| `clsx`, `tailwind-merge`               | 2.1.1, 3.7.0  | P1       | Class composition                                                |
| `resend`                               | 6.34.1        | P3       | Contact form email                                               |
| `@upstash/ratelimit`, `@upstash/redis` | 2.2.0, 1.39.0 | P3       | Serverless rate limiting                                         |
| `next-intl`                            | 4.14.9        | P5       | `/vi`, `/en` routing and messages                                |
| `@next/third-parties`                  | 16.4.2        | P6       | GA4 loader (after consent)                                       |
| `@anthropic-ai/sdk`                    | 1.1.0         | P8       | Claude rationale for quiz results                                |

### Tooling

| Package                                                      | Version                       | Purpose                               |
| ------------------------------------------------------------ | ----------------------------- | ------------------------------------- |
| `typescript`                                                 | 5.9.3                         | Strict type checking                  |
| `@types/node`, `@types/react`, `@types/react-dom`            | 22.20.5, 19.3.0, 19.3.0       | Types                                 |
| `tailwindcss`, `@tailwindcss/turbopack`                      | 4.3.3                         | Styling via the Turbopack CSS loader  |
| `eslint`, `eslint-config-next`                               | 9.39.5, 16.4.2                | Lint (flat config)                    |
| `prettier`, `prettier-plugin-tailwindcss`                    | 3.9.10, 0.8.1                 | Formatting, Tailwind class sorting    |
| `vitest`, `@vitejs/plugin-react`, `jsdom`                    | 5.0.5, 6.1.2, 30.1.3          | Unit and component tests              |
| `@testing-library/react`, `/dom`, `/jest-dom`, `/user-event` | 16.3.3, 10.4.2, 7.0.1, 14.6.8 | Component testing                     |
| `@playwright/test`                                           | 1.64.1                        | Browser smoke tests (`pnpm test:e2e`) |
| `@axe-core/playwright`                                       | 4.14.0                        | Accessibility audits (wired in P4)    |

Note: `eslint@9` is flagged deprecated upstream; it is the version `eslint-config-next@16.4.2` scaffolds with. Revisit when `eslint-config-next` supports ESLint 10.

---

## 2. Conditional Libraries

| Library | Purpose                    | Decision point                                                                     |
| ------- | -------------------------- | ---------------------------------------------------------------------------------- |
| `gsap`  | Scroll-driven choreography | P2, only if `motion` + CSS scroll-driven animations cannot deliver the pinned hero |

---

## 3. Explicitly Excluded Libraries

The following tools and libraries are deliberately omitted:

- **Redux / Zustand:** State in Thun Things is localized, URL-driven, or server-rendered. No global client store is required for < 10 products.
- **Prisma / Supabase:** Catalog data is maintained in typed code for low operational cost and instant build-time rendering. Supabase is evaluated only in Phase 7 for checkout.
- **Docker / Express / NestJS:** Vercel serverless deployment handles all hosting and API route requirements without server maintenance.
- **Turborepo / Monorepo:** Thun Things is a single cohesive web application. Monorepo tooling introduces unnecessary cognitive overhead for a solo developer.
