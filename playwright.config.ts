import { defineConfig, devices } from '@playwright/test';

// Dedicated port so a dev server from another project on :3000 is never reused.
const PORT = 3100;

export default defineConfig({
  testDir: 'e2e',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Most specs browse with a consent decision already made (analytics off) so the consent bar
    // stays out of their way; e2e/consent.spec.ts starts without one.
    storageState: 'e2e/fixtures/consent-decided.json',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
    // Test-only: leads stay in memory (no email, no Upstash), and a dummy GA id whose Google
    // requests every spec intercepts — the owner's real id is never contacted. Never put real
    // credentials here.
    env: { E2E_LEADS_SINK: 'memory', NEXT_PUBLIC_GA_ID: 'G-TEST000000' },
  },
});
