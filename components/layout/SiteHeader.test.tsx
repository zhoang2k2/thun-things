import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { SiteHeader } from '@/components/layout/SiteHeader';

const nav = [
  { href: '/about', label: 'Giới thiệu' },
  { href: '/contact', label: 'Liên hệ' },
];

it('renders a banner with the main navigation', () => {
  render(<SiteHeader nav={nav} />);
  const banner = screen.getByRole('banner');
  const navigation = within(banner).getByRole('navigation', { name: 'Điều hướng chính' });
  expect(within(navigation).getByRole('link', { name: 'Giới thiệu' })).toHaveAttribute(
    'href',
    '/about',
  );
  expect(within(navigation).getByRole('link', { name: 'Liên hệ' })).toHaveAttribute(
    'href',
    '/contact',
  );
  expect(within(banner).getByRole('link', { name: 'Thun Things' })).toHaveAttribute('href', '/');
});

it('does not render a language switch', () => {
  render(<SiteHeader nav={nav} />);
  expect(screen.queryByText(/^(VI|EN)$/)).not.toBeInTheDocument();
});
