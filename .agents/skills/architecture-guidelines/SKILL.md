---
name: architecture-guidelines
description: Architecture rules, Next.js App Router conventions, server/client boundaries, root folder layout, and data-access constraints.
---

# Architecture Guidelines for Thun Things

## 1. Modular Monolith Architecture

Thun Things is structured as a single Next.js modular monolith designed for a solo developer (< 10 hours/week).
Avoid complex microservices, external orchestration frameworks, or unnecessary abstractions.

## 2. Directory Structure & App Router Conventions

- **Root-based layout only:** Do NOT create or use a `src/` directory.
- `app/`: Next.js App Router routes, layouts, error boundaries, and API route handlers.
- `components/`: UI components organized by domain:
  - `components/ui/`: Generic reusable primitives (Button, Input, Dialog, Skeleton).
  - `components/layout/`: Global shell components (Header, Footer, LocaleSwitcher).
  - `components/home/`: Home-specific interactive components (HeroScroll, ProductDragGrid).
  - `components/shop/`: Catalog components (ProductCard, ProductGrid, StatusBadge).
  - `components/quiz/`: Quiz bot components (QuizLauncher, QuizBubble, QuizPopup).
  - `components/motion/`: Motion primitives and token definitions.
- `lib/`: Core logic and integration boundaries:
  - `lib/catalog/`: Data-access layer for products (`index.ts`, `schema.ts`, `data.ts`).
  - `lib/recommend/`: Pure recommendation algorithm scoring.
  - `lib/env.ts`: Zod-validated environment config.
  - `lib/leads/`: Lead sink interfaces and adapters.
  - `lib/analytics/`: Event dispatchers and consent management.
- `config/`: Application configuration constants.
- `styles/`: Additional styling definitions if needed.
- `types/`: Shared TypeScript definitions.
- `docs/`: Architecture decision records and agent workflows.

## 3. Server vs. Client Component Boundaries

- **Default to Server Components (RSC):** All layout, static content, data fetching, and metadata generation must remain Server Components.
- **Client Components (`"use client"`):** Use only when necessary for:
  - Event listeners (`onClick`, `onChange`, `onScroll`, `drag`).
  - React client hooks (`useState`, `useEffect`, `useReducer`, `useRef`).
  - Browser-only APIs (localStorage, window, matchMedia).
- **Push Client Boundaries to Leaves:** Keep client component boundaries as deep in the component tree as possible. Never mark entire pages as `"use client"` if only a button or popup is interactive.

## 4. Data Access Boundary

- All reads to catalog data MUST go through `lib/catalog/index.ts` (`listProducts`, `getProductBySlug`, `getFilters`).
- Do not import raw data arrays or mock data directly into pages or UI components.
- This boundary ensures seamless migration from TypeScript/Zod storage to Supabase/database in future phases without rewriting UI or bot modules.

## 5. Dependency Management Guardrails

- Favor standard Web APIs and official Next.js features over third-party npm packages.
- Consult the tech stack documentation before installing any dependency.
- Disallowed unless explicitly authorized by the owner: Redux, Zustand, Prisma, Supabase (pre-Phase 7), Docker, Express, NestJS, Turborepo.
