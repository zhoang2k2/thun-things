import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '@/app/page';

it('renders the brand heading', () => {
  render(<Page />);
  expect(screen.getByRole('heading', { level: 1, name: 'Thun Things' })).toBeInTheDocument();
});
