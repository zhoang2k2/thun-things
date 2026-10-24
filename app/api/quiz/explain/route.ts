import { NextResponse } from 'next/server';

import { explain } from '@/lib/ai/explain';
import { checkExplainRateLimit } from '@/lib/ai/rateLimit';
import { quizExplainSchema } from '@/lib/ai/schema';
import { readJsonBody } from '@/lib/security/jsonBody';
import { clientKey } from '@/lib/security/rateLimit';

// POST only: Next answers other methods with 405. 204 means "no rationale" for any reason (AI off,
// no key, every provider failed); the client hides the rationale either way.

export async function POST(request: Request) {
  const parsed = quizExplainSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request payload', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  const { ok } = await checkExplainRateLimit(clientKey(request.headers));
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, { status: 429 });
  }

  const result = await explain(parsed.data).catch((error: unknown) => {
    console.error('[ai] explain failed:', error instanceof Error ? error.name : 'unknown');
    return null;
  });
  if (!result) return new NextResponse(null, { status: 204 });
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
