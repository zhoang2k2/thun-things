import { describe, expect, it } from 'vitest';

import { buildCsp, securityHeaders } from '@/lib/security/csp';

const prod = { dev: false, preview: false };
const directive = (csp: string, name: string) =>
  csp.split('; ').find((part) => part === name || part.startsWith(`${name} `));

describe('buildCsp', () => {
  it('contains every production directive from the spec', () => {
    const csp = buildCsp(prod);
    expect(csp.split('; ')).toEqual([
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
      "font-src 'self'",
      "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ]);
  });

  it('omits upgrade-insecure-requests in development', () => {
    expect(buildCsp({ dev: true, preview: false })).not.toContain('upgrade-insecure-requests');
  });

  it('has no unsafe-eval and no vercel.live in production', () => {
    const csp = buildCsp(prod);
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).not.toContain('vercel.live');
  });

  it('adds unsafe-eval to script-src in development only', () => {
    expect(directive(buildCsp({ dev: true, preview: false }), 'script-src')).toBe(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
    );
  });

  it('adds vercel.live to script, connect, frame and img in preview', () => {
    const csp = buildCsp({ dev: false, preview: true });
    for (const name of ['script-src', 'connect-src', 'frame-src', 'img-src']) {
      expect(directive(csp, name)).toContain('https://vercel.live');
    }
    expect(directive(csp, 'style-src')).not.toContain('vercel.live');
    expect(csp).not.toContain('unsafe-eval');
  });
});

describe('securityHeaders', () => {
  it('returns the six headers with the specified values', () => {
    const headers = Object.fromEntries(securityHeaders(prod).map((h) => [h.key, h.value]));
    expect(Object.keys(headers)).toHaveLength(6);
    expect(headers['Content-Security-Policy']).toBe(buildCsp(prod));
    expect(headers['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains');
    expect(headers['Strict-Transport-Security']).not.toContain('preload');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()');
    expect(headers['X-Frame-Options']).toBe('DENY');
  });
});
