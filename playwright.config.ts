import { defineConfig, devices } from '@playwright/test';

// Dedicated port so a dev server from another project on :3000 is never reused.
const PORT = 3100;

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
    // Test-only: leads stay in memory (no email, no Upstash). Never put real credentials here.
    env: { E2E_LEADS_SINK: 'memory' },
  },
});
