# P9a2 — Simplified Product Statuses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Two product statuses (in stock → "Liên hệ đặt hàng"; sold out → "Liên hệ đặt trước" + up to 10% off), catalog migrated, notify-me form replaced by a pre-order purpose.

**Architecture:** Narrow `productStatusSchema` to `available | sold_out`; every consumer follows the type (status presentation, hover card, product page, order bar, quiz, AI prompt, JSON-LD, OG image); lead purposes swap `notify` for `preorder` with a prefill alias for old links.

**Tech Stack:** Next.js 16.4, next-intl, Zod 4, Vitest + RTL, Playwright + axe.

**Spec:** [`../specs/2026-10-25-p9a2-product-status-design.md`](../specs/2026-10-25-p9a2-product-status-design.md).

**Branch / PR:** `phase/p9a2-product-status` from `develop` → one PR; merged before P9b starts.

## Global Constraints

- Status ids `available`, `sold_out` only; migration map exactly P9a2-2 (14 / 10).
- Copy exactly per spec §2 (vi), natural English per P5 rules.
- Purposes `order`, `preorder`, `other`; `?purpose=notify` prefills `preorder`.
- Mobile order bar height unchanged (81px); discount line not in the bar.
- Keep P4–P9a guarantees: render modes, Lighthouse budgets, axe, both locales, CSP, HTML emails escaped.

## Review Focus

1. **Stale links** `/contact?purpose=notify&product=…` from before the change → Contact opens with "Đặt trước". Task 3.
2. **Removed statuses left anywhere** (data, messages, OG image, JSON-LD, AI prompt, tests) → type errors or a data test catch them. Tasks 1/2.
3. **Sold-out hover card** now has a button: layout fits the card and keyboard focus order stays correct. Task 2.
4. **Quiz with many sold-out matches** → exact sold-out match still shows first; ties prefer in stock. Task 1.

---

### Task 1: Status model, catalog migration, scoring

**Files:** Modify `lib/catalog/schema.ts`, `lib/catalog/data.ts`, `lib/catalog/status.ts`, `lib/recommend/score.ts`, `lib/ai/prompt.ts`, `lib/seo/jsonLd.ts`, `lib/seo/ogImage.tsx` (+ their tests).

- [ ] Tests: schema rejects `limited`/`preorder`/`coming_soon`; catalog has 14 `available`, 10 `sold_out`, no dropped notes; presentation `available` → order/neutral, `sold_out` → preorder/muted with offer; quiz bonus +1/0 and rank; AI availability strings; JSON-LD `InStock` / `BackOrder`.
- [ ] Commit `[REFACTOR] Reduce product statuses to in stock and sold out`.

### Task 2: Badges, buttons and the discount line

**Files:** Modify `components/product/{ProductAction,ProductHoverCard,ProductInfo,ProductOrderBar,StatusBadge}.tsx`, `messages/{vi,en}.json` (+ tests); remove the notify form from the product page.

- [ ] RTL: in stock shows "Còn hàng" + "Liên hệ đặt hàng" → `/contact?product=…&purpose=order`; sold out shows "Hết hàng" + "Liên hệ đặt trước" → `purpose=preorder` + "Giảm đến 10% khi đặt trước" in hover card and product page; order bar sold out shows the pre-order button and no `#notify` link; English labels.
- [ ] Commit `[FEATURE] Offer pre-order with up to 10% off on sold-out designs`.

### Task 3: Lead purposes

**Files:** Modify `lib/leads/{purposes,schema,types,prefill,actions,templates,emailHtml}.ts`, `components/forms/{ContactForm,useFormAnalytics}.tsx`, `lib/analytics/events.ts`, `content/policies/privacy.ts`, messages; delete `components/forms/NotifyForm.tsx` (+ test) (+ tests).

- [ ] Tests: purposes `order`/`preorder`/`other`; prefill `notify` → `preorder`; lead schema rejects `notify`; owner email "Đặt trước" + offer line; customer email uses the contact copy; analytics types; privacy text no longer mentions the notify form.
- [ ] Commit `[FEATURE] Replace notify-me with a pre-order contact purpose`.

### Task 4: E2E, docs, PR

- [ ] E2E: sold-out → pre-order → Contact prefilled → submit (memory sink); in-stock → order; old `purpose=notify` link; axe on a sold-out page; update specs that used removed statuses or the notify form.
- [ ] `thun-things.md` D-07, V-16, V-22, R-01 note; ADR-013; roadmap P9a2 → `IN REVIEW`; plan notes.
- [ ] `pnpm perf` within budgets; evidence PNGs per spec; full suite, push, PR, evidence, CI.

## P9a2 Acceptance

- [ ] Only two statuses in code and data; copy and buttons per spec in vi/en.
- [ ] Sold-out pre-order flow reaches the owner as "Đặt trước" with the offer noted; old notify links still work.
- [ ] CI green; evidence in the PR; owner merged before P9b.
