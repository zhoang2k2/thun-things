# Launch Checklist

> Owner-facing steps for P9 (roadmap). P9a code is done when its PR is merged; the rest is owner input. Agents never read or set real environment values; this list says what to set and where.

## Now: running on `thun-things.vercel.app` (P9a)

While `NEXT_PUBLIC_SITE_URL` is a `*.vercel.app` address the site answers `noindex`, so it can be shared but stays out of search results.

1. **Vercel → Settings → Environment Variables → Production.** A production build stops with a list of names if any of these is missing:
   - [ ] `NEXT_PUBLIC_SITE_URL` = `https://thun-things.vercel.app`
   - [ ] `RESEND_API_KEY`
   - [ ] `LEADS_TO_EMAIL` = the Gmail that receives leads
   - [ ] `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
   - [ ] `NEXT_PUBLIC_GA_ID`
   - [ ] `AI_ENABLED` = `true` and `GEMINI_API_KEY` (from a billing-enabled Google Cloud project, with a budget alert); optional `ANTHROPIC_API_KEY` as fallback
   - Leave `LEADS_FROM_EMAIL` empty until the domain is verified (the test sender only reaches the Resend account owner, so customers get no confirmation email yet).
2. [ ] **GA4 data retention:** GA4 → Admin → Data collection and modification → Data retention: choose 2 or 14 months, then tell the agent so the privacy policy states it.
3. [ ] Send a test lead from the live site and check the HTML notification in Gmail (also on the phone).

## Before real selling (P9b inputs)

4. [ ] **Photos** (JPEG or WebP, sRGB, longest side ≥ 2000px, no text baked in):
   - Hero banners: desktop 16:9 and mobile 4:5 for each banner.
   - Each design: front and back, 4:5 (the back photo also powers the P11 lens).
   - About page photo, 4:5.
   - Name files by product slug, e.g. `hoang-hon-01-front.jpg`, `hoang-hon-01-back.jpg`.
5. [ ] **Returns policy:** conditions, number of days, who pays shipping, pre-order delivery time, deposit and cancellation.
6. [ ] **Privacy policy:** how long request emails are kept; the email address for data requests.
7. [ ] **About page:** the brand story, the people behind Thun Things, how a drop comes together.
8. [ ] **R-01:** review each design shown as "sold out" while stock exists; prefer truthful labels ("limited run", "coming soon", "pre-order").
9. [ ] Legal review of the privacy and cookie texts (Decree 13/2023/ND-CP; GDPR if selling abroad).

## When the `.com` domain exists (P9b)

10. [ ] Buy the domain; Vercel → Settings → Domains: add `<name>.com` (and `www.<name>.com` redirecting to it); set the DNS records Vercel shows.
11. [ ] Redirect `thun-things.vercel.app` to the `.com` (Vercel domain redirect, 308).
12. [ ] **Resend → Domains:** add the domain, set the SPF and DKIM records it shows, wait for "Verified".
13. [ ] Set `LEADS_FROM_EMAIL` = `hello@<name>.com` (customers start receiving confirmation emails in their language) and `NEXT_PUBLIC_SITE_URL` = `https://<name>.com` (indexing turns on); redeploy.
14. [ ] **Google Search Console:** add a Domain property, verify with the DNS TXT record, submit `https://<name>.com/sitemap.xml`.
15. [ ] Ask the agent to re-run `pnpm perf` with the real photos and to check the live site end to end.
