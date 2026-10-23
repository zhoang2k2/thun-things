import { copy } from '@/content/copy/vi';

export const SkipLink = () => (
  <a
    href="#main"
    className="SkipLink bg-ink text-canvas focus-visible:outline-accent sr-only z-50 px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus-visible:outline-2"
  >
    {copy.a11y.skipToContent}
  </a>
);
