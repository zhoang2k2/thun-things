# Technology Stack & Dependency Decisions

> **Reference:** For product constraints and delivery milestones, refer to [`thun-things.md`](../../thun-things.md).

---

## 1. Installed Baseline Dependencies (Bootstrap)

Every installed dependency serves an immediate infrastructure requirement for the technical baseline:

| Package                           | Version  | Layer            | Rationale                                                                                         |
| --------------------------------- | -------- | ---------------- | ------------------------------------------------------------------------------------------------- |
| **`next`**                        | `16.4.0` | Framework        | Latest stable App Router release with Turbopack, React 19 support, and integrated route handlers. |
| **`react`**                       | `19.3.0` | UI Library       | Officially supported React release for Next.js 16.4.                                              |
| **`react-dom`**                   | `19.3.0` | DOM Renderer     | React 19 DOM bindings.                                                                            |
| **`typescript`**                  | `5.9.3`  | Language         | Strict static typing and type safety across components and business logic.                        |
| **`tailwindcss`**                 | `4.3.3`  | Styling          | High-performance CSS engine with CSS variable token integration and zero-runtime overhead.        |
| **`@tailwindcss/turbopack`**      | `4.3.3`  | Tooling          | Turbopack optimization loader for Tailwind CSS v4.                                                |
| **`zod`**                         | `4.6.7`  | Validation       | Runtime type validation for environment variables (`lib/env.ts`), catalog data, and API payloads. |
| **`next-intl`**                   | `4.14.9` | Localization     | Official App Router internationalization library supporting `/vi` and `/en` routing.              |
| **`vitest`**                      | `5.0.4`  | Testing          | Fast, Vite-native test runner with instant feedback and native TypeScript/ESM support.            |
| **`@testing-library/react`**      | `16.3.3` | Testing          | DOM testing utilities encouraging accessible, user-centric testing patterns.                      |
| **`@testing-library/jest-dom`**   | `7.0.1`  | Testing          | Custom Jest/Vitest matchers for asserting DOM element states.                                     |
| **`@vitejs/plugin-react`**        | `6.1.2`  | Tooling          | React transform plugin for Vitest.                                                                |
| **`jsdom`**                       | `30.1.2` | Test Environment | Headless DOM implementation for Vitest component tests.                                           |
| **`eslint`**                      | `9.39.5` | Code Quality     | Pluggable linting utility enforcing code quality.                                                 |
| **`eslint-config-next`**          | `16.4.0` | Code Quality     | Next.js and React Core Web Vitals ESLint ruleset.                                                 |
| **`prettier`**                    | `3.9.10` | Code Formatting  | Opinionated code formatter ensuring uniform styling.                                              |
| **`prettier-plugin-tailwindcss`** | `0.8.1`  | Formatting       | Automatic sorting of Tailwind CSS classes in JSX/TSX.                                             |

---

## 2. Deferred Libraries (Future Phases)

To prevent premature dependency bloat, these libraries are thoroughly researched but **deferred** until their specific implementation phase:

| Library                         | Intended Purpose                                                      | Target Phase       | Deferral Rationale                                                                                                          |
| ------------------------------- | --------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **`motion`** (Motion for React) | Interactive layout animations, card-to-PDP shared-element transitions | Phase 1 / 2        | Bootstrap requires only CSS variable tokens and minimal smoke testing; interactive animation is introduced in Phase 1.      |
| **`gsap`**                      | Scroll-driven choreographies                                          | Phase 2 (Optional) | Only needed if CSS scroll-driven animations or Motion fail to satisfy complex pinned hero requirements.                     |
| **`radix-ui`**                  | Accessible primitives (Dialog, Popover)                               | Phase 1 / 4        | Installed selectively per component rather than bulk-installing the entire suite.                                           |
| **`lucide-react`**              | Iconography                                                           | Phase 1            | UI icons are not required during bootstrap smoke testing.                                                                   |
| **`playwright`**                | Browser smoke testing                                                 | Phase 2 / 6        | Unit and component testing with Vitest/RTL is sufficient for bootstrap; Playwright is added when user-facing flows go live. |
| **`axe-core`**                  | Automated accessibility auditing                                      | Phase 6            | Audits will be introduced during the pre-launch hardening phase.                                                            |
| **`resend`**                    | Email delivery for contact form                                       | Phase 3            | Form submission endpoints are implemented in Phase 3; requires domain verification.                                         |
| **`@anthropic-ai/sdk`**         | AI rationale for quiz recommendations                                 | Phase 5            | Quiz bot v1 in Phase 4 is deterministic; LLM blurb generation is added in Phase 5.                                          |
| **`@upstash/ratelimit`**        | Serverless rate limiting                                              | Phase 4 / 5        | In-memory development limits suffice until public API endpoints are exposed.                                                |

---

## 3. Explicitly Excluded Libraries

The following tools and libraries are deliberately omitted:

- **Redux / Zustand:** State in Thun Things is localized, URL-driven, or server-rendered. No global client store is required for < 10 products.
- **Prisma / Supabase:** Catalog data is maintained in typed code for low operational cost and instant build-time rendering. Supabase is evaluated only in Phase 7 for checkout.
- **Docker / Express / NestJS:** Vercel serverless deployment handles all hosting and API route requirements without server maintenance.
- **Turborepo / Monorepo:** Thun Things is a single cohesive web application. Monorepo tooling introduces unnecessary cognitive overhead for a solo developer.
