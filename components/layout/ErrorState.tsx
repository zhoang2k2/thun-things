import type { ReactNode } from 'react';

interface ErrorStateProps {
  title: string;
  body: string;
  /** Action slot: links or buttons. */
  children?: ReactNode;
}

// Presentational frame for the 404 and error pages. Mirrors PageShell's visual language.
export const ErrorState = ({ title, body, children }: ErrorStateProps) => (
  <div className="ErrorState mx-auto max-w-screen-2xl px-4 py-16 md:px-8 md:py-24">
    <h1 className="ErrorState__title text-5xl leading-none font-bold tracking-tight md:text-7xl">
      {title}
    </h1>
    <p className="ErrorState__body text-ink-muted mt-8 max-w-prose">{body}</p>
    {children && <div className="ErrorState__actions mt-12 flex flex-wrap gap-4">{children}</div>}
  </div>
);
