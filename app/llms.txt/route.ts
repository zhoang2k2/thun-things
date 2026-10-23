import { buildLlmsTxt } from '@/lib/seo/llms';

// No request data is read, so Next prerenders this handler at build time.
export const GET = () =>
  new Response(buildLlmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
