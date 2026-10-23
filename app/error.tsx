'use client';

import Link from 'next/link';

import { ErrorState } from '@/components/layout/ErrorState';
import { Button, buttonClasses } from '@/components/ui/Button';
import { copy } from '@/content/copy/vi';

const page = copy.errors.generic;

// The error value is never rendered: its message, digest and stack stay out of the UI.
export default function RouteError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <ErrorState title={page.title} body={page.body}>
      <Button size="lg" onClick={() => retry()}>
        {page.retry}
      </Button>
      <Link href="/" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
        {copy.errors.notFound.home}
      </Link>
    </ErrorState>
  );
}
