import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { Badge } from '@/components/ui/Badge';

it('renders badge tone', () => {
  render(<Badge tone="accent">Còn hàng</Badge>);
  expect(screen.getByText('Còn hàng')).toHaveClass('Badge', 'Badge--accent');
});

it('defaults to the neutral tone', () => {
  render(<Badge>Hết hàng</Badge>);
  expect(screen.getByText('Hết hàng')).toHaveClass('Badge--neutral');
});
