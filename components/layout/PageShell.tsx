import type { ReactNode } from 'react';

interface PageShellProps {
  title: string;
  children?: ReactNode;
}

// Shared frame for text pages until P2/P3 give them real content.
export const PageShell = ({ title, children }: PageShellProps) => (
  <div className="PageShell mx-auto max-w-screen-2xl px-4 py-16 md:px-8 md:py-24">
    <h1 className="PageShell__title text-5xl leading-none font-bold tracking-tight md:text-7xl">
      {title}
    </h1>
    {children && <div className="PageShell__body text-ink-muted mt-8 max-w-prose">{children}</div>}
  </div>
);
