import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['node_modules/**', 'e2e/**', '.next/**'],
    // next-intl's navigation imports `next/navigation` without an extension, which Node's ESM
    // resolver rejects; inlining lets Vite resolve it.
    server: { deps: { inline: ['next-intl'] } },
  },
});
