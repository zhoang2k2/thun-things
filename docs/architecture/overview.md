# Architecture Overview

> **Source of Truth:** For complete product strategy and delivery roadmap, see [`thun-things.md`](../../thun-things.md).

---

## 1. System Philosophy

Thun Things is built as a **modular monolith** on **Next.js App Router** with TypeScript strict mode and Tailwind CSS.

### Why Next.js App Router?

1. **Server Components by Default:** Renders fast, zero-JS HTML for marketing, catalog, and informational pages, preserving mobile performance.
2. **SSG/ISR with Dynamic Route Handlers:** Allows static pre-rendering for product pages alongside serverless API routes (`/api/contact`, `/api/quiz/*`) without maintaining separate backend services.
3. **Built-in Multilingual SEO:** Native support for localized metadata, canonical tags, Open Graph, and sitemaps via standard Next.js conventions.
4. **Fast Developer Experience:** Turbopack provides near-instant local dev server boots and hot module reloading.

### Why a Modular Monolith?

The project is maintained by a solo developer with limited weekly time (< 10 hours/week).

- **Zero Microservice Overhead:** Avoids distributed deployments, API contract versioning, cross-service networking, and multi-repo synchronization.
- **Clear Domain Boundaries:** Code is strictly segmented into feature components, domain libraries, and framework routes, keeping cognitive load low.
- **Easy Evolution:** Modules have well-defined interfaces (e.g., `lib/catalog` data access, `lib/leads` sinks) that can be migrated to external databases or services without touching UI code.

---

## 2. Directory Layout (Root-Based)

The repository follows a clean, root-based Next.js structure without a `src/` wrapper:

```
├── app/                  # Next.js App Router: layouts, pages, route handlers
│   ├── layout.tsx        # Root HTML shell with font and global tokens
│   ├── page.tsx          # Initial framework smoke-test page
│   └── globals.css       # Tailwind CSS v4 setup and CSS token variables
├── components/           # UI components organized by domain
│   ├── ui/               # Generic accessible primitives (Button, Input, Dialog)
│   ├── layout/           # Shared layout (Header, Footer, LocaleSwitcher)
│   ├── home/             # Home page interactive sections (HeroScroll, ProductDragGrid)
│   ├── shop/             # Catalog views (ProductCard, ProductGrid, StatusBadge)
│   ├── quiz/             # AI quiz bot UI (QuizLauncher, QuizPopup, QuizBubble)
│   └── motion/           # Animation primitives and tokens (tokens.ts, Reveal)
├── lib/                  # Business logic and external boundaries
│   ├── env.ts            # Zod-validated environment schema and access
│   ├── catalog/          # Data-access layer (schema.ts, data.ts, index.ts)
│   ├── recommend/        # Pure recommendation scoring engine
│   ├── leads/            # Contact and waitlist storage sink interface
│   └── analytics/        # Consent management and typed GA4 event helpers
├── config/               # App configuration, site constants, and navigation links
├── styles/               # Optional global style definitions
├── types/                # Shared TypeScript types and declarations
├── docs/                 # Architecture, ADRs, and agent workflow guides
├── .agents/skills/       # Canonical project skills for AI coding agents
├── .claude/skills/       # Symlinked skill entry points for Claude Code
├── AGENTS.md             # Canonical AI agent instructions
├── CLAUDE.md             # Claude Code quickstart guide
└── thun-things.md        # Single source of truth for product strategy
```

### Path Alias

Imports are mapped using `@/*` pointing to `./*` from the project root (e.g., `@/lib/env` resolves to `./lib/env.ts`).

---

## 3. Data Boundaries & Future Extensions

To maintain long-term maintainability, the following structural boundaries are enforced:

1. **Catalog Boundary (`lib/catalog`):**
   - In Phases 0–6, products are stored as typed TypeScript data validated by Zod in the repository.
   - All page components and API routes MUST query products through `lib/catalog/index.ts` (`listProducts`, `getProductBySlug`, `getFilters`).
   - When migrating to Supabase or an external database in Phase 7, only the implementation inside `lib/catalog` changes; UI components remain untouched.

2. **Lead Sink Boundary (`lib/leads`):**
   - Contact inquiries and waitlist signups are handled by a single `LeadSink` interface.
   - Initial implementation sends notifications via Resend; future sinks (Google Sheets, Supabase) plug in behind the same interface.

3. **Recommendation Engine (`lib/recommend`):**
   - Quiz matching logic is implemented as pure, deterministic TypeScript functions with comprehensive unit tests before any LLM rationale is added.
