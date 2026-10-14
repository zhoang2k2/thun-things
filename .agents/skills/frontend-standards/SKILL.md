---
name: frontend-standards
description: Frontend standards covering React 19, TypeScript strict mode, semantic HTML, component composition, accessibility (WCAG 2.2 AA), and minimal client-side JavaScript.
---

# Frontend Standards for Thun Things

## 1. TypeScript & React 19 Conventions

- **Strict Mode:** Strict mode is mandatory (`strict: true`). Do not disable strict flags.
- **No Unjustified `any`:** Use explicit types, generics, or `unknown` with narrowing. If an external API is untyped, write a Zod schema to validate and infer the type.
- **Explicit Interfaces:** Define component prop types using `interface` or `type`. Keep props minimal, cohesive, and clearly documented.
- **Functional Components:** Use standard function declarations or const arrow functions. Avoid class components.
- **Immutability:** Treat props and state as strictly immutable.

## 2. Semantic HTML & Accessible Architecture (WCAG 2.2 AA Target)

- **Semantic Landmarks:** Always structure layouts using `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, and `<footer>`.
- **Heading Hierarchy:** Ensure exactly one `<h1>` per page. Follow strict hierarchical order (`<h1>` -> `<h2>` -> `<h3>`) without skipping levels.
- **Interactive Elements:** Use native `<button>` for actions and `<a>` (or Next.js `<Link>`) for navigation. Never place click handlers on `<div>` or `<span>` without full ARIA role and keyboard bindings.
- **Form Controls:** Every form input must have an associated `<label>` (explicit `htmlFor` or nested). Error messages must be linked using `aria-describedby` and `aria-invalid`.
- **Accessible Focus:** Ensure visible focus rings (`focus-visible:ring-2`) for all interactive elements.

## 3. Component Composition Patterns

- **Container / Presentational Separation:** Separate data fetching / state orchestration from visual rendering.
- **Slot Composition:** Prefer children and ReactNode slots (`leftAction`, `icon`, `children`) over large configuration objects with dozens of boolean flags.
- **State States:** Every data-driven component must explicitly handle and display three states:
  - **Loading:** Skeleton or subtle loading indicator (no layout shift).
  - **Error:** User-friendly message with retry or contact option.
  - **Empty:** Helpful empty-state messaging with fallback CTA.

## 4. Responsive & Mobile-First Design

- **Mobile-First Breakpoints:** Design for small screens first (360px–390px mobile viewport), then scale to tablet (`md:`) and desktop (`lg:`, `xl:`).
- **Touch Targets:** Minimum interactive target size is 44x44px on mobile devices.
- **Viewport Fluidity:** Avoid fixed pixel widths that cause horizontal scrollbars. Use CSS Grid and Flexbox with responsive container constraints.

## 5. Minimizing Client-Side JavaScript

- Strive for zero runtime JavaScript on informational content.
- Use native HTML/CSS features where possible (e.g. `<details>`/`<summary>` for simple accordions, CSS `:hover`/`:focus` transitions).
- Lazy-load interactive popups, quizzes, and modal bundles using dynamic imports (`next/dynamic`) with `{ ssr: false }` to preserve mobile First Input Delay (FID) and Interaction to Next Paint (INP).
