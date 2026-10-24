# P6 Cookie Consent & GA4 — Design

**Date:** 2026-10-24
**Builds on:** [`2026-10-23-p5-i18n-design.md`](./2026-10-23-p5-i18n-design.md) (locales, messages), [`2026-10-23-p4-quality-hardening-design.md`](./2026-10-23-p4-quality-hardening-design.md) (CSP, budgets), D-14 and §10.2–10.3 in `thun-things.md`
**Roadmap:** P6 in [`../plans/2026-10-22-roadmap.md`](../plans/2026-10-22-roadmap.md)

## Goal

Visitors choose whether to allow analytics through a bilingual consent bar; GA4 loads only after they accept, records the owner's key events without personal data, and can be turned off again at any time from the footer.

## Owner decisions [USER, 2026-10-24]

| ID   | Decision                                                                                                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P6-1 | **Bottom bar** consent banner: one short sentence and three buttons — Accept / Reject / Customize. It never blocks browsing; on mobile product pages it sits above the order bar.            |
| P6-2 | **Two categories only:** Necessary (always on; stores the choice) and Analytics (GA4, off until accepted). No marketing category; Google's ad signals are always denied.                     |
| P6-3 | **GA collects in production only.** On previews and locally, GA runs only when the URL carries `?ga_debug=1`, which also turns on GA4 debug mode for DebugView. One measurement ID.          |
| P6-4 | **Consent Mode "Basic"** (agent ruling from D-14 "GA4 loads only after consent"): no request to any Google domain before the visitor accepts; Advanced mode's cookieless pings are not used. |

**[OPEN] legal:** Vietnamese personal-data rules (Decree 13/2023/ND-CP and successors) and GDPR exposure for `/en` visitors. P6 uses the strictest common pattern (opt-in, reject as easy as accept, revocable, documented in the privacy policy); the owner confirms with a qualified advisor before real sales. Not legal advice.

## Blockers and how P6 handles them

| Blocker                               | Handling                                                                                                                                                                                                        |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No GA4 property / measurement ID yet  | Code and tests do not need it: Playwright builds with a dummy `NEXT_PUBLIC_GA_ID` and intercepts every Google request. The owner creates the property and sets the ID before the acceptance check in DebugView. |
| Real events must be seen in DebugView | Owner opens the Vercel preview with `?ga_debug=1`, accepts, clicks around; events show in GA4 → Admin → DebugView.                                                                                              |
| CSP blocks Google today               | CSP adds only the Google tag and GA collection origins (section 4).                                                                                                                                             |
| Legal review open                     | Strict opt-in default (above); listed as an owner task before launch (P9), not a P6 blocker.                                                                                                                    |
| Privacy policy must list GA4          | P6 updates both locales (section 6).                                                                                                                                                                            |

## 1. Consent state

- Stored in `localStorage` key `thun-things.consent` as `{ version: 1, analytics: boolean, decidedAt: ISO string }`; no cookie is set by our code. Missing, unreadable, or older `version` → no decision → banner shows. Bumping `version` re-asks everyone (e.g. when categories change).
- `lib/analytics/consent.ts` (pure, unit-tested): `readConsent()`, `writeConsent(analytics)`, `clearAnalyticsCookies()` (deletes `_ga`, `_ga_*` on the current host and parent domain), with `try/catch` around storage so private modes never crash.
- `ConsentProvider` (client, in the locale layout) exposes `{ decided, analytics, accept(), reject(), save(analytics), openSettings() }`.

## 2. UI

- `ConsentBanner`: fixed bottom bar, ink text on canvas, 1px top border, square buttons (DR-1/DR-2), `role="region"` with an accessible name, keyboard order Accept → Reject → Customize, focus is not stolen on load. Rendered only after hydration when no decision exists, so returning visitors never see a flash and the static shell is unchanged (no CLS: the bar overlays, it does not push content).
- `ConsentSettings`: a native `<dialog>` (focus trapped, Escape closes) with the two categories, the Analytics checkbox, Save and Cancel; opened from Customize and from the footer link "Cài đặt cookie" / "Cookie settings" (always available).
- Mobile product pages: the bar stacks above `ProductOrderBar` (body padding accounts for both while the bar is visible).
- Copy in `messages/{vi,en}.json` under `consent` (English per P5 rules).
- Reduced motion: no slide-in animation; otherwise a short fade using motion tokens.

## 3. GA4 loading

- `lib/analytics/env.ts`: `analyticsMode = 'off' | 'production' | 'debug'` from `NEXT_PUBLIC_GA_ID` (via `@/lib/env`), `VERCEL_ENV` (platform marker, read on the server at build) and the `?ga_debug=1` flag (kept in `sessionStorage` for the tab). `off` when there is no ID, or outside production without the debug flag.
- `Analytics` (client, lazy) renders `@next/third-parties/google`'s `GoogleAnalytics` only when mode ≠ `off` **and** analytics consent is granted. Before it loads, an inline config sets `gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })`; debug mode adds `debug_mode: true`.
- Page views: GA4 enhanced measurement (history changes) counts App Router navigations; no manual `page_view`.
- Revoking: `gtag('consent', 'update', { analytics_storage: 'denied' })`, analytics cookies cleared, event helper stops sending; the already-loaded script stays until the next full load (documented).

## 4. CSP

`lib/security/csp.ts` adds, in every environment: `script-src https://www.googletagmanager.com`; `connect-src https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`; `img-src https://*.google-analytics.com https://*.googletagmanager.com`. Nothing else changes; the CSP unit test pins the full directive list.

## 5. Events (no personal data)

`lib/analytics/events.ts` exports `trackEvent(name, params)` typed per event; it is a no-op unless GA is loaded and consent granted. Parameters are enums, slugs and ids only — never email, phone, name, address or message text.

| Event                | When                                                                          | Params                                                |
| -------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| `select_item`        | a product tile or card link is activated                                      | `product_id`, `status`, `locale`                      |
| `hover_preview_open` | a hover card opens (pointer, focus or first tap), once per tile per page view | `product_id`, `status`                                |
| `contact_start`      | first interaction with the contact or notify-me form on a page view           | `purpose`, `form` (`contact`/`notify`), `product_id?` |
| `contact_submit`     | a submission succeeds (in-place state)                                        | `purpose`, `form`, `product_id?`, `locale`            |
| `locale_switch`      | the VI/EN switch is used                                                      | `from`, `to`                                          |

GA4 adds `page_location`; the contact page query (`?product=&purpose=`) contains no personal data.

## 6. Privacy policy

Both locales gain a "Cookies and analytics" section: what GA4 collects (pages viewed, the events above, approximate location and device from Google), the `_ga` cookies and their lifetime, that analytics is off until accepted, how to change the choice (footer link), Google as processor, and the data-retention period set in GA4 (`[Owner to update]` until the owner chooses; GA4 default 2 months). The "Cookie" section from P4 is replaced.

## 7. Testing

- Unit: consent storage (missing, corrupt, old version, private-mode throws), analytics mode matrix, CSP directives, event payload types and a "no PII keys" check, cookie clearing.
- RTL: banner shows only without a decision; Accept/Reject/Save update state; settings dialog focus and Escape; footer link reopens settings; both locales.
- E2E (dummy ID, all Google routes intercepted and counted): no Google request before a decision; none after Reject; gtag requested after Accept and the five events reach the stubbed collector with the expected params and no PII; decision persists across reload; revoking clears `_ga*` and stops events; preview-like build without `?ga_debug=1` loads nothing even after Accept; axe with the banner and dialog open; mobile product page bar stacking; CSP violation watcher stays empty with GA loaded.
- Lighthouse budgets re-checked (pre-consent state, as a first visit sees it).

## Out of scope

Marketing pixels, server-side tagging, cookie banner A/B tests, GA4 dashboards and reports (owner), quiz events (P7).
