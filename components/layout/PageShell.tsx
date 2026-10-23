import type { ReactNode } from 'react';

interface PageShellProps {
  title: string;
  /** Muted lead text under the title. */
  intro?: ReactNode;
  children?: ReactNode;
}

// Shared frame for text pages (About, Contact, Policy).
export const PageShell = ({ title, intro, children }: PageShellProps) => (
  <div className="PageShell mx-auto max-w-screen-2xl px-4 py-16 md:px-8 md:py-24">
    <h1 className="PageShell__title text-5xl leading-none font-bold tracking-tight md:text-7xl">
      {title}
    </h1>
    {intro && <div className="PageShell__intro text-ink-muted mt-8 max-w-prose">{intro}</div>}
    {children && <div className="PageShell__body mt-12">{children}</div>}
  </div>
);
