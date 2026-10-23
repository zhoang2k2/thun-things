import '@testing-library/jest-dom/vitest';

import { vi } from 'vitest';

// Server modules guard themselves with `server-only`; tests run them directly.
vi.mock('server-only', () => ({}));
