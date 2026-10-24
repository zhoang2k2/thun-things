import '@testing-library/jest-dom/vitest';

import { MotionGlobalConfig } from 'motion';
import { vi } from 'vitest';

// Server modules guard themselves with `server-only`; tests run them directly.
vi.mock('server-only', () => ({}));

// jsdom has no matchMedia; default to "no match". Tests can override with vi.stubGlobal.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// Run motion animations instantly so enter/exit states are deterministic in tests.
MotionGlobalConfig.skipAnimations = true;

// Components using the App Router render outside Next in tests. Pages render at `/vi` with no
// query unless a test sets `usePathname` / `useSearchParams` with `vi.mocked(...)`.
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: vi.fn(() => '/vi'),
  useSelectedLayoutSegment: vi.fn(() => null),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));
