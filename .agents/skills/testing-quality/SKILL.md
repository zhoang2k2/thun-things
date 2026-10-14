---
name: testing-quality
description: Testing strategies and quality gates, Vitest, React Testing Library, accessibility auditing, smoke tests, and regression prevention.
---

# Testing & Quality Guidelines for Thun Things

## 1. Testing Strategy Pyramid

Maintain high test confidence with minimal execution overhead:

1. **Unit Tests (Vitest):** Fast, deterministic tests for pure utility functions, Zod schemas, data validation, scoring algorithms (`lib/recommend/score.ts`), and environment parsing (`lib/env.ts`).
2. **Component Tests (React Testing Library):** User-centric behavior tests verifying accessibility, DOM output, state transitions, and form validation.
3. **Smoke Tests (Playwright / Vitest):** High-level tests verifying critical paths (page loads, locale switches, contact submissions).

## 2. React Testing Library Best Practices

- **Test User Behavior, Not Implementation:** Query elements by accessible role (`getByRole('button', { name: /gửi/i })`), label text (`getByLabelText`), or visible text. Avoid querying by CSS classes or internal state.
- **Async Handling:** Use `findBy*` queries or `waitFor` when waiting for asynchronous updates, animations, or resolved promises.
- **User Events:** Prefer `@testing-library/user-event` over `fireEvent` to replicate realistic browser event sequences.
- **Accessibility Assertions:** Use `@testing-library/jest-dom` matchers (`toBeVisible`, `toBeDisabled`, `toHaveAttribute`, `toHaveFocus`).

## 3. Mandatory Test Coverage per Feature

- **UI Components:**
  - Status badges render proper copy per status.
  - CTAs construct correct navigation targets (`/contact?product=slug&purpose=...`).
  - Loading, empty, and error states render correctly.
- **Forms & Data Mutations:**
  - Client-side validation triggers on invalid inputs.
  - Form submission handles server success and error responses gracefully.
  - Honeypot spam fields silently abort submission.
- **Recommendation & Algorithms:**
  - Scoring functions handle ties, missing attributes, and zero-match fallbacks deterministically.

## 4. Accessibility Testing (Target WCAG 2.2 AA)

- Test interactive widgets with keyboard-only navigation (`Tab`, `Shift+Tab`, `Enter`, `Escape`, Arrow keys).
- Verify focus traps inside open dialogs or quiz cards (`Dialog`, `QuizPopup`).
- Integrate automated accessibility checks (`axe-core`) on core pages in later phases.

## 5. Local Quality Gates (Must Pass Before Commit)

Every modification must satisfy the full validation suite:

```bash
pnpm typecheck   # Zero TypeScript errors
pnpm lint        # Zero ESLint warnings/errors
pnpm format:check# Zero Prettier formatting violations
pnpm test        # All unit and component tests passing
pnpm build       # Next.js production build succeeds
```
