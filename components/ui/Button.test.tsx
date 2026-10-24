import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button, buttonClasses } from '@/components/ui/Button';

describe('Button', () => {
  it('defaults to a medium primary button of type button', () => {
    render(<Button>Gửi</Button>);
    const button = screen.getByRole('button', { name: 'Gửi' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('Button', 'Button--primary', 'Button--md', 'h-10');
  });

  it('primary button uses on-accent text', () => {
    render(<Button>Gửi</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-accent', 'text-on-accent');
    expect(button).not.toHaveClass('text-white');
  });

  it('applies size heights', () => {
    render(
      <>
        <Button size="sm">Nhỏ</Button>
        <Button size="lg">Lớn</Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Nhỏ' })).toHaveClass('h-8');
    expect(screen.getByRole('button', { name: 'Lớn' })).toHaveClass('h-12');
  });

  it('keeps an explicit submit type', () => {
    render(<Button type="submit">Gửi</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('buttonClasses merges custom classes', () => {
    expect(buttonClasses({ variant: 'secondary', className: 'w-full' })).toContain('w-full');
    expect(buttonClasses({ variant: 'secondary' })).toContain('Button--secondary');
  });
});
