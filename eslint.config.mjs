import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Internal links need the locale prefix: use the wrappers from `@/i18n/navigation`.
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'next/link', message: "Use `Link` from '@/i18n/navigation'." },
            {
              name: 'next/navigation',
              importNames: ['useRouter', 'usePathname'],
              message: "Use the locale-aware hooks from '@/i18n/navigation'.",
            },
          ],
        },
      ],
    },
  },
  {
    // Tests drive the App Router mocks underneath those wrappers.
    files: ['**/*.test.ts', '**/*.test.tsx', 'vitest.setup.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
