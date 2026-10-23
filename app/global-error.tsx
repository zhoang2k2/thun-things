'use client';

import './globals.css';

import { ErrorState } from '@/components/layout/ErrorState';
import { Button } from '@/components/ui/Button';
import { copy } from '@/content/copy/vi';

const page = copy.errors.generic;

// Replaces the root layout when it fails, so it stays minimal: no header, footer or router links.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="vi">
      <body>
        <title>{page.title}</title>
        <ErrorState title={page.title} body={page.body}>
          <Button size="lg" onClick={() => retry()}>
            {page.retry}
          </Button>
        </ErrorState>
      </body>
    </html>
  );
}
