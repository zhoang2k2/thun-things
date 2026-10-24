import { NextResponse } from 'next/server';

import { checkQuizRateLimit } from '@/lib/recommend/rateLimit';
import { recommend } from '@/lib/recommend/recommend';
import { quizRequestSchema } from '@/lib/recommend/schema';
import { clientKey } from '@/lib/security/rateLimit';

// POST only: Next answers other methods with 405. Errors never echo input or internals.
const MAX_BODY_BYTES = 1_024;

const invalid = () =>
  NextResponse.json(
    { error: 'Invalid request payload', code: 'VALIDATION_ERROR' },
    { status: 400 },
  );

export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return invalid();

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return invalid();
  }
  const parsed = quizRequestSchema.safeParse(json);
  if (!parsed.success) return invalid();

  const { ok } = await checkQuizRateLimit(clientKey(request.headers));
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, { status: 429 });
  }

  const result = recommend(parsed.data);
  if (!result) {
    return NextResponse.json({ error: 'No products', code: 'EMPTY_CATALOG' }, { status: 503 });
  }
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
