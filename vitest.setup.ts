import '@testing-library/jest-dom/vitest';

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
