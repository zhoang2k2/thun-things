import 'server-only';

import { createRateLimiter } from '@/lib/security/rateLimit';

// 30 quiz requests per 10 minutes per client (spec section 3).
export const QUIZ_RATE_LIMIT = { max: 30, windowMs: 10 * 60 * 1000 } as const;

export const checkQuizRateLimit = createRateLimiter({
  ...QUIZ_RATE_LIMIT,
  window: '10 m',
  prefix: 'thun-things:quiz',
  label: 'quiz',
});
