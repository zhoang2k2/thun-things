export type CspOptions = {
  /** Next development server: React needs `eval` for debugging aids. */
  dev: boolean;
  /** Vercel preview deployment: the Vercel toolbar needs vercel.live. */
  preview: boolean;
};

export type SecurityHeader = { key: string; value: string };

const VERCEL_LIVE = 'https://vercel.live';

// GA4 (P6): the Google tag script and the collection endpoints. The script itself only loads
// after analytics consent; these entries just allow it then.
const GOOGLE_TAG = 'https://www.googletagmanager.com';
const GA_COLLECT = ['https://*.google-analytics.com', 'https://*.analytics.google.com'];
const GTM_ANY = 'https://*.googletagmanager.com';

/**
 * Static Content-Security-Policy (no nonce, so pages stay prerendered).
 * Pure: the caller decides `dev` / `preview`.
 */
export const buildCsp = ({ dev, preview }: CspOptions): string => {
  const live = preview ? [VERCEL_LIVE] : [];
  const directives: [string, string[]][] = [
    ['default-src', ["'self'"]],
    [
      'script-src',
      ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : []), GOOGLE_TAG, ...live],
    ],
    ['style-src', ["'self'", "'unsafe-inline'"]],
    ['img-src', ["'self'", 'data:', 'blob:', GA_COLLECT[0], GTM_ANY, ...live]],
    ['font-src', ["'self'"]],
    ['connect-src', ["'self'", ...GA_COLLECT, GTM_ANY, ...live]],
    ...(preview ? ([['frame-src', live]] as [string, string[]][]) : []),
    ['frame-ancestors', ["'none'"]],
    ['form-action', ["'self'"]],
    ['base-uri', ["'self'"]],
    ['object-src', ["'none'"]],
    // Dev only: would break plain-http LAN testing from phones.
    ...(dev ? [] : ([['upgrade-insecure-requests', []]] as [string, string[]][])),
  ];
  return directives.map(([name, values]) => [name, ...values].join(' ')).join('; ');
};

export const securityHeaders = (options: CspOptions): SecurityHeader[] => [
  { key: 'Content-Security-Policy', value: buildCsp(options) },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
];
