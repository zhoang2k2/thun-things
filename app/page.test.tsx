import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from './page';

describe('HomePage Smoke Test', () => {
  it('renders the application brand heading', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Thun Things');
  });

  it('renders the technical bootstrap status note', () => {
    render(<HomePage />);
    expect(screen.getByText(/Technical bootstrap smoke test/i)).toBeInTheDocument();
  });
});
