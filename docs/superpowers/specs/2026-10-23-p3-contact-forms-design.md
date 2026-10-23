# P3 Contact, Notify-me, Policy & About — Design

**Date:** 2026-10-23
**Builds on:** [`2026-10-23-ui-direction-v3-design.md`](./2026-10-23-ui-direction-v3-design.md) (V-13, V-20, V-22, V-26), [`2026-10-23-p2-catalog-grid-design.md`](./2026-10-23-p2-catalog-grid-design.md)
**Roadmap:** P3 in [`../plans/2026-10-22-roadmap.md`](../plans/2026-10-22-roadmap.md)

## Owner decisions [USER, 2026-10-23]

| ID   | Decision                                                                                                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P3-1 | Contact (order) form fields: **email** and **phone / Zalo** are required; **name, size, quantity, shipping address, message** are optional. Product and purpose are prefilled from the link. |
| P3-2 | Notify-me form on the sold-out product page asks for **email or phone** — at least one is required.                                                                                          |
| P3-3 | Every submission **notifies the owner** and sends the customer a **confirmation email** (when the customer gave an email).                                                                   |
| P3-4 | A **required consent checkbox** ("Tôi đồng ý với chính sách bảo mật", linking the privacy policy); the consent flag is stored with the lead.                                                 |

## Constraint on P3-3

Without a verified domain, Resend only delivers from `onboarding@resend.dev` to the account owner's own address, so customer confirmations cannot arrive before P9. The confirmation email is built and tested now but sent only when `CUSTOMER_CONFIRMATION_ENABLED=true` (default `false`); the owner enables it at P9 after verifying the domain. Owner notifications work from day one when `LEADS_TO_EMAIL` is the Resend account address.

## Forms

**Contact page `/contact`** (V-13, order fallback for V-20):

- Reads `?product=<slug>&purpose=<order|notify|other>` (inside `<Suspense>`, Cache Components). A known slug shows a small product summary (placeholder image, name, price); an unknown slug is ignored. `purpose` defaults to `order` with a product, `other` without one.
- Fields: purpose (radio: Đặt mua / Báo khi có hàng / Câu hỏi khác), email*, phone/Zalo*, name, size (select from the product's sizes, or free text without a product), quantity (1–20), shipping address, message, consent*.
- Errors are shown per field (`aria-invalid`, `aria-describedby`) and summarised at the top with focus moved to the summary; success replaces the form with a confirmation message.

**Notify-me on `/products/<slug>`** (V-22), sold-out only, replacing P2's link:

- One "email or phone" pair (two inputs, at least one filled), consent*, submit. Inline success / error.

**Shared rules**

- Server Functions (`'use server'`) with `useActionState`; the forms work without client JS (progressive enhancement).
- Validation: one Zod schema per form in `lib/leads/schema.ts`, used by the server function; Vietnamese messages from `content/copy/vi.ts`. Phone accepts Vietnamese mobile formats (`0xxxxxxxxx`, `+84xxxxxxxxx`, spaces/dots allowed).
- Spam: hidden honeypot field (any value → pretend success, send nothing); rate limit 5 submissions / 10 min per IP via Upstash.
- **Disabled state:** when `RESEND_API_KEY` or `LEADS_TO_EMAIL` is missing, or Upstash is missing in production, the form renders disabled with a note and the contact email (if configured); the server function refuses too.

## Leads

- `Lead = { kind: 'contact' | 'notify', purpose, email?, phone?, name?, size?, quantity?, address?, message?, productId?, productSlug?, locale: 'vi', consent: true, createdAt }`.
- `LeadSink` interface (`lib/leads/sink.ts`): `deliver(lead: Lead): Promise<void>`. P3 implements `emailSink` (Resend): owner notification (plain, scannable: purpose, product, contact fields) + optional customer confirmation. Later sinks (Sheet, Supabase) plug in without touching forms.
- No lead data in logs; errors log only the failure reason.

## Content

- **Policy** (`/policy/privacy`, `/policy/returns`): structured placeholder text in `content/policies/` marked `TODO(owner)`. The privacy text lists email/phone collection, Resend as processor, and the consent flag. Real text blocks launch (P9), not P3.
- **About**: one text block + one photo (V-12); copy placeholder marked `TODO(owner)`, photo via `MediaImage` (V-26 placeholder until supplied).

## New configuration

| Variable                        | Scope  | Default | Purpose                                                                      |
| ------------------------------- | ------ | ------- | ---------------------------------------------------------------------------- |
| `CUSTOMER_CONFIRMATION_ENABLED` | server | `false` | Send confirmation emails to customers (enable at P9 with a verified domain). |

## Out of scope

Chat channel integration (owner link only, V-20), analytics events (P6), i18n (P5), storing leads anywhere but email (P10).
