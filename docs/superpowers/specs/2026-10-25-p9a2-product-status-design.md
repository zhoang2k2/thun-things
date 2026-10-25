# P9a2 Simplified Product Statuses — Design

**Date:** 2026-10-25
**Builds on:** D-07, R-01 and V-16/V-22 in `thun-things.md`; P2 catalog and hover card, P3 lead forms, P7 quiz scoring, P8 AI prompt, P9a emails
**Roadmap:** P9a2, between P9a (done) and P9b (go-live); must be DONE before P9b [USER].

## Goal

Replace the five product statuses with two that match how the shop sells today: **in stock** (contact to order) and **sold out** (contact to pre-order, up to 10% off). Migrate the catalog and every place that shows or uses a status.

## Owner decisions [USER, 2026-10-25]

| ID     | Decision                                                                                                                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P9a2-1 | Two statuses only: **Còn hàng** (button "Liên hệ đặt hàng") and **Hết hàng** (button "Liên hệ đặt trước", with "Giảm đến 10% khi đặt trước" shown under the button).                                     |
| P9a2-2 | Migration: `available`, `limited` → in stock; `preorder`, `coming_soon`, `sold_out` → sold out (15 in stock, 9 sold out in the current mock catalog). Real per-product statuses arrive with P9b content. |
| P9a2-3 | The sold-out "notify me" form is **replaced** by the pre-order button, which opens Contact with a new purpose **Đặt trước** and the product prefilled.                                                   |
| P9a2-4 | Quiz: in stock +2, sold out 0 (was −3); ties still prefer in stock.                                                                                                                                      |

## 1. Data model

- `productStatusSchema = z.enum(['available', 'sold_out'])`: the two existing ids are kept, so URLs, analytics values and stored leads stay valid.
- `lib/catalog/data.ts`: statuses migrated per P9a2-2. Mock `statusNote`s tied to removed statuses are dropped ("Chỉ còn vài chiếc mỗi size", "Mỗi chiếc là duy nhất", "Giao hàng sau 3 tuần"); the field stays for real notes. `releasedAt` stays (quiz tie-break).
- A schema test fails on any other status value.

## 2. Labels and where they appear

| Status      | Badge (vi / en)     | Badge style       | Button (vi / en)                         | Under the button (vi / en)                                    | Button target                  |
| ----------- | ------------------- | ----------------- | ---------------------------------------- | ------------------------------------------------------------- | ------------------------------ |
| `available` | Còn hàng / In stock | ink outline       | Liên hệ đặt hàng / Contact to order      | —                                                             | Contact, purpose **Đặt hàng**  |
| `sold_out`  | Hết hàng / Sold out | grey fill (muted) | Liên hệ đặt trước / Contact to pre-order | Giảm đến 10% khi đặt trước / Up to 10% off when you pre-order | Contact, purpose **Đặt trước** |

- **Hover card:** name, price, badge, button; for sold out the discount line sits under the button (sold-out cards now have a button, V-16 updated).
- **Product page (desktop):** price, badge, optional note, button, and the discount line for sold out. The notify-me form is removed.
- **Mobile order bar:** price and button only (its height is fixed at 81px for the consent bar and quiz offsets); the discount line shows in the page body above.
- **Quiz result:** badge only (unchanged).
- Copy in `messages/{vi,en}.json` (`product.status`, `product.actions`, new `product.preorderOffer`); English follows the P5 copy rules.

## 3. Leads

- Purposes become `order` (Đặt hàng / Order), `preorder` (Đặt trước / Pre-order) and `other`. `notify` is retired: an incoming `?purpose=notify` link prefills `preorder`, so old links keep working.
- The notify-me form (`NotifyForm`), its lead kind and its analytics form name are removed; every lead comes from the Contact form.
- Emails: the owner subject and heading read "Đặt trước" for pre-orders, with "Ưu đãi đến 10% khi đặt trước" under the product. The customer confirmation uses the contact success copy for every purpose.

## 4. Other consumers

- **Quiz scoring** (`lib/recommend/score.ts`): status bonus `available` +2, `sold_out` 0; status rank available before sold out.
- **AI prompt** (`lib/ai/prompt.ts`): availability "in stock" or "sold out, can be pre-ordered with up to 10% off".
- **JSON-LD** (`lib/seo/jsonLd.ts`): `available` → `InStock`, `sold_out` → `BackOrder` (orderable while out of stock).
- **OG image** (`lib/seo/ogImage.tsx`): accent marker only for the remaining states (none for sold out).
- **Analytics**: `select_item` / `hover_preview_open` keep `status`; `contact_*` purposes follow §3.
- **Privacy policy**: the "notify me" form mention becomes the Contact form only (vi/en).
- **`thun-things.md`**: D-07 and V-16/V-22 updated; R-01 note kept: a design shown as sold out while stock exists is still misleading; the pre-order discount must be honoured as advertised.

## Testing

- Unit: schema accepts only the two statuses; catalog migration counts (15/9) and no removed status anywhere in data; status presentation (labels, tones, purposes); prefill maps `notify` → `preorder`; lead schema rejects `notify`, accepts `preorder`; emails show "Đặt trước" and the offer line; quiz bonus/rank; AI prompt availability text; JSON-LD `BackOrder`.
- RTL: hover card and product page for both statuses (button, discount line, no notify form); order bar for sold out (pre-order button, no `#notify` link).
- E2E: sold-out product → pre-order button → Contact with purpose "Đặt trước" and the product prefilled → submit; in-stock product → "Liên hệ đặt hàng"; existing specs updated for removed statuses and the notify form; axe on a sold-out product page.
- Lighthouse budgets unchanged; evidence: hover card and product page for both statuses (vi), mobile order bar sold out, Contact prefilled with Đặt trước.

## Out of scope

Real product list and per-product statuses (P9b content), stock counts, automatic discount calculation or checkout.
