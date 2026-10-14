---
name: security-guidelines
description: Security practices, secret management, server-side API boundaries, input validation, rate limiting, and privacy/consent compliance.
---

# Security & Privacy Guidelines for Thun Things

## 1. Environment & Secret Management

- **Never Expose Server Secrets:** Credentials such as `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, and `UPSTASH_REDIS_REST_TOKEN` must NEVER be prefixed with `NEXT_PUBLIC_` or imported in Client Components.
- **Single Access Point:** All environment variables must be accessed via `@/lib/env`.
- **Git Hygiene:** Verify `.env*` rules in `.gitignore`. Never commit `.env.local` or raw secret strings.
- **Fail Fast:** If an essential secret is invalid in production, fail explicitly at runtime rather than silently proceeding with broken integrations.

## 2. Server-Side API Boundaries & Route Handlers

- **Always Validate Inputs with Zod:** Every route handler (`app/api/*/route.ts`) must validate incoming `request.json()` against a strict Zod schema before processing.
- **Sanitize Error Responses:** Never return raw database errors, stack traces, or internal error messages to client consumers. Return structured JSON error objects with user-friendly messages:
  ```json
  { "error": "Invalid request payload", "code": "VALIDATION_ERROR" }
  ```
- **HTTP Methods:** Explicitly reject unsupported HTTP methods by returning `405 Method Not Allowed`.

## 3. Rate Limiting & Abuse Prevention

- **Public Endpoint Protection:** All public POST routes (`/api/contact`, `/api/quiz/explain`, `/api/quiz/recommend`) must implement rate limiting per IP (via Upstash Redis or edge middleware).
- **Honeypot Protection:** Public forms must include an invisible honeypot field (`website` or `confirm_email`). If populated, treat as a spam bot and return a fake success without processing.
- **AI Spend Limits:**
  - Hard monthly spend cap set in the Anthropic Console.
  - Enforce strict request timeouts (e.g. 4 seconds) on LLM calls with immediate deterministic fallback.
  - User answers to the AI quiz must be strictly enum-based; never interpolate arbitrary free-form user strings directly into system prompts.

## 4. Privacy & Consent Compliance (GDPR & Vietnam Decree 13/2023/ND-CP)

- **Consent-First Analytics:** Google Analytics 4 (and any non-essential storage) must remain disabled until the user explicitly accepts cookies via the consent banner.
- **No PII in Events:** GA4 events (`contact_submit`, `select_item`) must never include personal identifiable information (emails, names, phone numbers) in parameter objects.
- **Consent Persistence:** Store consent choices in local storage with the timestamp. Provide a visible mechanism in the footer for users to revoke or update cookie preferences at any time.
- **Privacy Policy Disclosure:** Ensure the privacy policy explicitly outlines email collection purposes, AI data processing (quiz blurb generation), and user data deletion contact methods.
