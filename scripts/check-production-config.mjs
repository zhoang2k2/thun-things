// Runs before `next build` (P9a spec section 3). On Vercel production builds only, it refuses to
// build when a variable the live site needs is missing, so a broken deploy never replaces a working
// one. Local, CI and preview builds pass through. It prints variable names, never values.
import { pathToFileURL } from 'node:url';

const REQUIRED = [
  'NEXT_PUBLIC_SITE_URL',
  'RESEND_API_KEY',
  'LEADS_TO_EMAIL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'NEXT_PUBLIC_GA_ID',
];

const present = (value) => typeof value === 'string' && value.trim() !== '';

/** @param {Record<string, string | undefined>} vars */
export const productionConfigProblems = (vars) => {
  if (vars.VERCEL_ENV !== 'production') return [];
  const problems = REQUIRED.filter((name) => !present(vars[name])).map(
    (name) => `${name} is missing`,
  );
  if (present(vars.NEXT_PUBLIC_SITE_URL) && !vars.NEXT_PUBLIC_SITE_URL.startsWith('https://')) {
    problems.push('NEXT_PUBLIC_SITE_URL must be an https URL');
  }
  if (
    vars.AI_ENABLED === 'true' &&
    !present(vars.GEMINI_API_KEY) &&
    !present(vars.ANTHROPIC_API_KEY)
  ) {
    problems.push('AI_ENABLED=true needs GEMINI_API_KEY or ANTHROPIC_API_KEY');
  }
  return problems;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const problems = productionConfigProblems(process.env);
  if (problems.length > 0) {
    console.error(
      'Production configuration is incomplete (Vercel → Settings → Environment Variables):',
    );
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
}
