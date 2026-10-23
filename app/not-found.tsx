import Link from 'next/link';

import { ErrorState } from '@/components/layout/ErrorState';
import { buttonClasses } from '@/components/ui/Button';
import { copy } from '@/content/copy/vi';

const page = copy.errors.notFound;

// Next adds noindex and the 404 status itself; only the title and description are set here.
export const metadata = { title: page.title, description: page.description };

export default function NotFound() {
  return (
    <ErrorState title={page.title} body={page.body}>
      <Link href="/" className={buttonClasses({ size: 'lg' })}>
        {page.home}
      </Link>
      <Link href="/contact" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
        {page.contact}
      </Link>
    </ErrorState>
  );
}
