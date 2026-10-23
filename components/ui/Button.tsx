import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // DR-1/accent rule: text on the accent is always ink, never white.
  primary: 'bg-accent text-on-accent hover:bg-ink hover:text-canvas',
  secondary: 'border border-ink bg-canvas text-ink hover:bg-ink hover:text-canvas',
  ghost: 'text-ink underline-offset-4 hover:underline',
};

// 8-point grid: 32 / 40 / 48 px controls.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const buttonClasses = ({
  variant = 'primary',
  size = 'md',
  className,
}: ButtonStyleOptions = {}): string =>
  cn(
    `Button Button--${variant} Button--${size}`,
    'inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase transition-colors',
    'focus-visible:outline-ink focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-40',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );

type ButtonProps = ComponentProps<'button'> & Omit<ButtonStyleOptions, 'className'>;

export const Button = ({ variant, size, className, type = 'button', ...props }: ButtonProps) => (
  <button type={type} className={buttonClasses({ variant, size, className })} {...props} />
);
