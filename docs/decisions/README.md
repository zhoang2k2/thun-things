# Architecture Decision Records (ADR)

> **Source of Truth:** For overarching business and product decisions, refer to [`thun-things.md`](../../thun-things.md).

This directory tracks significant technical and architectural choices made during the development of Thun Things.

---

## Index of Decisions

| ADR         | Title                                                        | Status       | Date       |
| ----------- | ------------------------------------------------------------ | ------------ | ---------- |
| **ADR-001** | Next.js 16 and React 19 Version Baseline                     | **Accepted** | 2026-10-15 |
| **ADR-002** | Root-Based Project Structure (No `src/` Directory)           | **Accepted** | 2026-10-15 |
| **ADR-003** | Vitest and React Testing Library for Testing Baseline        | **Accepted** | 2026-10-15 |
| **ADR-004** | In-Repository TypeScript Catalog Data with Data-Access Layer | **Accepted** | 2026-10-15 |
| **ADR-005** | Lean Bootstrap Dependency Policy                             | Superseded   | 2026-10-15 |
| **ADR-006** | UI Direction v3 Shell                                        | **Accepted** | 2026-10-23 |

---

### ADR-001: Next.js 16 and React 19 Version Baseline

- **Context:** `thun-things.md` noted an open version decision (R-07): current Next.js stable releases require React 19, whereas older baseline assumptions referenced React 18.
- **Decision:** Use **Next.js 16.4.0** (App Router with Turbopack) paired with **React 19.3.0**.
- **Rationale:** Next.js 16 provides official stability, enhanced server caching, Partial Prerendering capabilities, and native Turbopack support. Modern ecosystem libraries (`next-intl`, `@testing-library/react`, `zod`) have complete React 19 compatibility.
- **Consequences:** All components and testing infrastructure use React 19 types (`@types/react@^19`).

---

### ADR-002: Root-Based Project Structure (No `src/` Directory)

- **Context:** Framework initializers often prompt for a `src/` directory.
- **Decision:** Place `app/`, `components/`, `lib/`, `config/`, `styles/`, and `types/` directly at the project root.
- **Rationale:** A root-based layout is the standard modern Next.js convention. It shortens file paths, reduces nesting depth, and simplifies mental models for both the solo developer and AI coding agents.
- **Consequences:** Import alias `@/*` is configured in `tsconfig.json` to resolve to `./*`.

---

### ADR-003: Vitest and React Testing Library for Testing Baseline

- **Context:** Fast feedback is essential for maintaining code quality in an AI-agent-assisted project.
- **Decision:** Adopt **Vitest 5.x** with **React Testing Library** and `jsdom`.
- **Rationale:** Vitest natively supports ESM and TypeScript without cumbersome Babel or Jest configuration. It executes in milliseconds, integrates seamlessly with Turbopack/Vite conventions, and runs in GitHub Actions CI with minimal resource consumption.
- **Consequences:** Tests use `.test.ts` and `.test.tsx` extensions. A centralized setup file (`vitest.setup.ts`) configures jest-dom matchers.

---

### ADR-004: In-Repository TypeScript Catalog Data with Data-Access Layer

- **Context:** Thun Things has fewer than 10 products in its initial launch catalog. Provisioning and maintaining Supabase/Prisma at bootstrap adds cost and configuration complexity.
- **Decision:** Store catalog items as statically typed TypeScript objects validated by Zod schemas in `lib/catalog/data.ts`. Require all application reads to pass through `lib/catalog/index.ts`.
- **Rationale:** Build-time static generation delivers instant page loads, zero hosting cost, and eliminates database connection pooling issues on serverless functions. The strict data-access layer ensures that migrating to a database in Phase 7 requires zero changes to UI components or recommendation algorithms.
- **Consequences:** All catalog edits are version-controlled via Git commits until an administrative CMS is warranted.

---

### ADR-005: Lean Bootstrap Dependency Policy

> **Superseded (2026-10-22):** the owner chose to install every roadmap library in P0 (roadmap v2, P0 plan). Libraries are installed but only wired in their phase.

- **Context:** Greenfield projects frequently accumulate dependencies that are not needed until later phases.
- **Decision:** Defer installation of future libraries (Motion, GSAP, Radix UI, Resend, Anthropic SDK, GA4, Upstash) until their designated phases (P1–P5).
- **Rationale:** Minimizes security vulnerability surface area, keeps `pnpm install` fast, prevents peer dependency conflicts, and enforces focus on foundational infrastructure.
- **Consequences:** Future phases install libraries incrementally with clear acceptance tests.

---

### ADR-006: UI Direction v3 Shell

- **Context:** The owner replaced UI Direction v2 with v3 and added binding design rules DR-1 (no radius) and DR-2 (art/photography/fashion, no "AI slop") — see `docs/superpowers/specs/2026-10-23-ui-direction-v3-design.md`.
- **Decision:**
  - Typeface **Bricolage Grotesque** via `next/font/google` (`latin` + `vietnamese`); accent `#FF5A1F` as a swappable token with ink text on it.
  - The shell is Server Components only; owner-editable values (email, socials, nav) live in `config/site.ts`; strings in `content/copy/vi.ts`.
  - DR-1/DR-2 are enforced by `tests/design-rules.test.ts` (no `rounded-*`, no non-zero `border-radius`, no gradients, no `lucide-react`); the Tailwind radius scale is cleared.
  - Icons come from Hugeicons only; `lucide-react` was removed.
  - Every image goes through `MediaImage`, which renders the V-26 placeholder when no source exists.
  - Policy pages are two static routes: a dynamic `/policy/[slug]` returned `200` for unknown slugs under Partial Prerendering.
- **Consequences:** Swapping accent, typeface, or contact details touches one token or config entry. New UI that curves or uses gradients fails CI. The glass-layer exemption was removed with the V-25 glass layer (2026-10-23).
