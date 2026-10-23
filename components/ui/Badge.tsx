import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'accent' | 'muted';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'border border-ink text-ink',
  accent: 'bg-accent text-on-accent',
  muted: 'bg-line text-ink-muted',
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

export const Badge = ({ tone = 'neutral', children }: BadgeProps) => (
  <span
    className={cn(
      `Badge Badge--${tone}`,
      'inline-flex h-6 items-center px-2 text-xs font-medium tracking-wide uppercase',
      TONE_CLASSES[tone],
    )}
  >
    {children}
  </span>
);
