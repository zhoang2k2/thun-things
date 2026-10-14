---
name: implementation-workflow
description: Disciplined implementation workflow for AI agents, covering requirement intake, scope boundary checks, concise planning, minimal execution, automated validation, and structured reporting.
---

# Implementation Workflow for AI Agents

Follow this 6-step discipline for every feature, bugfix, or refactoring task in Thun Things.

## Step 1: Read Requirements & Source of Truth

- Read `thun-things.md` and `AGENTS.md` before touching code.
- Consult relevant project skills in `.agents/skills/` (architecture, frontend, motion, i18n, testing, security).
- Identify the explicit user request and reject any implicit feature creep.

## Step 2: Identify Scope & Unresolved Decisions

- Parse decisions according to the project tags:
  - `[USER]`: Confirmed decision. Must be followed strictly.
  - `[PROPOSED]`: Recommended design. Verify before modifying core behavior.
  - `[ASSUMPTION]`: Unverified assumption. Follow safe reversible defaults.
  - `[OPEN]`: Unresolved blocker. If required for the immediate task, ask the owner max 3 targeted questions; otherwise, defer.
- Clearly delineate what is in scope vs. out of scope for the current iteration.

## Step 3: Create a Concise Plan

- Formulate an implementation plan with bite-sized tasks.
- For each task, declare:
  - Exact files to create or modify.
  - Data contracts, inputs, and outputs.
  - Test verification strategy (TDD approach where applicable).
- Keep plans minimal and focused on the immediate deliverable.

## Step 4: Implement Minimal Changes

- Make the smallest possible change that satisfies the task requirements.
- Follow established code conventions:
  - Strict TypeScript types (no `any`).
  - Server Components by default.
  - Centralized motion tokens for animations.
  - Accessible HTML semantics and responsive Tailwind utility classes.
- Do not introduce unrequested third-party libraries.

## Step 5: Validate with Quality Gates

Run all local verification scripts before declaring the task complete:

```bash
# 1. Typecheck
pnpm typecheck

# 2. Linting
pnpm lint

# 3. Formatting
pnpm format:check

# 4. Unit / Component tests
pnpm test

# 5. Production build
pnpm build
```

If any check fails, diagnose and fix the root cause immediately. Never commit failing code.

## Step 6: Structured Reporting

Deliver the final report to the owner:

- Language: **Vietnamese**.
- Summary of changes made (files created, modified).
- Verification results (test outputs, build status).
- Any open questions, remaining manual tasks, or next recommended steps.
