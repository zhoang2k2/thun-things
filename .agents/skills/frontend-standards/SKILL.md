---
name: frontend-standards
description: Frontend standards for React 19, strict TypeScript, component composition, semantic HTML, accessibility (WCAG 2.2 AA), responsive design, and minimal client-side JavaScript.
---

# Frontend Standards for Thun Things

## 1. TypeScript, React, and Source Style

- **Strict Mode:** Strict mode is mandatory (`strict: true`). Do not disable strict flags.
- **No Unjustified `any`:** Use explicit types, generics, or `unknown` with narrowing. If an external API is untyped, write a Zod schema to validate and infer the type.
- **Explicit Interfaces:** Define component prop types using `interface` or `type`. Keep props minimal, cohesive, and clearly documented.
- **Components:** Prefer arrow function components. Use a function declaration when required by a framework, API, or established project pattern; avoid class components.
- **Immutability:** Treat props and state as strictly immutable.
- Use clear names and follow repository file naming: PascalCase for component files and camelCase for other files.
- Keep reusable or domain-level constants outside rendering components. A local one-use value may stay near its use when extraction would reduce clarity.
- Follow repository import conventions. If none exist, group side-effect/style, framework/runtime, third-party, internal/shared, feature API/UI, then relative imports, with one blank line between non-empty groups. Keep type-only imports with their owning group.
- Follow Prettier and ESLint for formatting and syntax layout; do not add conflicting style rules.

## 2. Component Boundaries and JSX

- Keep route components focused on routing, metadata, page composition, and framework boundaries. Put reusable UI and business logic in project-defined modules.
- Prefer feature ownership. Shared UI must not import feature implementation details; avoid circular and deep cross-feature imports.
- Keep JSX declarative. Prepare display values, callbacks, and conditional content before `return`; do not put IIFEs, statements, array transformations, nested ternaries, or template-building logic inside JSX.
- Prefer children and focused slots over configuration objects with many boolean flags.
- Keep simple state local. Extract hooks or helpers for reusable logic, side effects, asynchronous behavior, domain rules, or complexity that obscures the component.
- Prefer guard clauses for invalid, loading, permission, and error states. Use `switch` for finite states with three or more branches. Avoid nested ternaries and `else` after a branch that returns.

## 3. Tailwind and Styling

- Give authored DOM elements stable BEM hook classes before Tailwind classes: `Block`, `Block__element`, or `Block--modifier`. Exclude fragments, `html`, `body`, and markup rendered internally by third-party components.
- Use BEM hooks for discoverability and semantic structure, not to duplicate Tailwind declarations or create nesting-dependent selectors.
- Use an existing `cn()` helper for conditional or merged classes when the project provides one. A single immutable class string does not need `cn()`; do not add a dependency solely to format static classes.
- Avoid inline `style` attributes unless a runtime value cannot be represented safely with existing CSS or tokens and the project permits it.
- **Design rules (binding, see UI Direction v3 spec):**
  - **DR-1 No radius.** Never use `rounded-*` or non-zero `border-radius`; reset native controls to square. No exceptions (the former glass layer was removed). Icon stroke caps are not covered.
  - **DR-2 Art / photography / fashion, no "AI slop".** Photographs carry the page; flat colour, hard edges, print/photo references (print borders, plate numbers, captions). Do not use gradients, soft/blurred shadows, glow, glass panels or blur layers, pill buttons or badges, decorative icons, emoji, sparkle/AI symbols, Inter/Space Grotesk as defaults, centred headline + two-button hero templates, or three-column feature grids.
  - **Icons:** Hugeicons (`@hugeicons/react` + `@hugeicons/core-free-icons`) only, functional icons only; prefer a text label when it reads naturally.
  - `tests/design-rules.test.ts` enforces radius, gradient, and icon-library rules.
- Use established design tokens and responsive patterns. Design mobile-first for 360–390px, then scale to tablet and desktop. Avoid fixed widths that cause horizontal scrolling; target 44×44px touch controls.

## 4. Semantic HTML and Accessibility (WCAG 2.2 AA)

- **Semantic Landmarks:** Always structure layouts using `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, and `<footer>`.
- **Heading Hierarchy:** Ensure exactly one `<h1>` per page. Follow hierarchical order (`<h1>` -> `<h2>` -> `<h3>`) without skipping levels.
- Use native `<button>` for actions and `<a>` (or Next.js `<Link>`) for navigation. Do not use `<div>` or `<span>` as interactive controls.
- **Form Controls:** Every form input must have an associated `<label>` (explicit `htmlFor` or nested). Error messages must be linked using `aria-describedby` and `aria-invalid`.
- **Accessible Focus:** Ensure visible focus rings (`focus-visible:ring-2`) for all interactive elements.
- Do not assign positive `tabIndex`; use `tabIndex={-1}` only for an established focus-management pattern.
- Use meaningful image alt text and empty alt text for decorative images. Use list elements for lists and paragraphs for prose.
- Follow repository lint and formatting rules for attribute ordering and other syntax conventions.

## 5. Component Composition and Data States

- **Container / Presentational Separation:** Separate data fetching / state orchestration from visual rendering.
- **Slot Composition:** Prefer children and ReactNode slots (`leftAction`, `icon`, `children`) over large configuration objects with dozens of boolean flags.
- Every data-driven component must explicitly handle and display three states:
  - **Loading:** Skeleton or subtle loading indicator (no layout shift).
  - **Error:** User-friendly message with retry or contact option.
  - **Empty:** Helpful empty-state messaging with fallback CTA.

## 6. Minimal Client-Side JavaScript and Motion

- Strive for zero runtime JavaScript on informational content.
- Use native HTML/CSS features where possible (e.g. `<details>`/`<summary>` for simple accordions, CSS `:hover`/`:focus` transitions).
- Lazy-load interactive popups, quizzes, and modal bundles when it improves initial loading. Follow the installed Next.js documentation for supported dynamic-import options.
- For animation and reduced-motion behavior, also follow [motion-guidelines](../motion-guidelines/SKILL.md).

## 7. Task Routing and Validation

- Read applicable repository instructions, product specifications, and project skills before implementation. Apply only edge rules supported by the task or repository evidence; state the active rules at the start of implementation.
- If a required convention is missing or conflicts with an approved specification, stop and ask the owner before complex implementation.
- Do not add dependencies, frameworks, state managers, or architecture layers solely to satisfy a generic convention.
- Run the configured formatter, lint, typecheck, and relevant tests when the task scope requires them. Review changed UI for semantic HTML, JSX logic separation, BEM hooks, keyboard behavior, and accessibility.
