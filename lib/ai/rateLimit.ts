import 'server-only';

import { createRateLimiter } from '@/lib/security/rateLimit';

// 10 rationale requests per 10 minutes per client (P8 spec section 1).
export const EXPLAIN_RATE_LIMIT = { max: 10, windowMs: 10 * 60 * 1000 } as const;

export const checkExplainRateLimit = createRateLimiter({
  ...EXPLAIN_RATE_LIMIT,
  window: '10 m',
  prefix: 'thun-things:explain',
  label: 'explain',
});
