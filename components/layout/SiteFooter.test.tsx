import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { SiteFooter } from '@/components/layout/SiteFooter';

const policies = [
  { href: '/policy/privacy', label: 'Bảo mật' },
  { href: '/policy/returns', label: 'Đổi trả' },
];

it('renders policy links', () => {
  render(<SiteFooter policies={policies} socials={[]} />);
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Bảo mật' })).toHaveAttribute('href', '/policy/privacy');
  expect(screen.getByRole('link', { name: 'Đổi trả' })).toHaveAttribute('href', '/policy/returns');
});

it('hides email and socials when unset', () => {
  const { container } = render(<SiteFooter policies={policies} socials={[]} />);
  expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  expect(screen.queryByText('Mạng xã hội')).not.toBeInTheDocument();
  expect(screen.queryByText('Email')).not.toBeInTheDocument();
});

it('shows email and socials when set', () => {
  render(
    <SiteFooter
      policies={policies}
      contactEmail="hi@example.com"
      socials={[{ label: 'Instagram', href: 'https://instagram.com/thunthings' }]}
    />,
  );
  expect(screen.getByRole('link', { name: 'hi@example.com' })).toHaveAttribute(
    'href',
    'mailto:hi@example.com',
  );
  const instagram = screen.getByRole('link', { name: 'Instagram' });
  expect(instagram).toHaveAttribute('href', 'https://instagram.com/thunthings');
  expect(instagram.getAttribute('rel')).toContain('noopener');
});

it('hides the oversized wordmark from assistive technology', () => {
  const { container } = render(<SiteFooter policies={policies} socials={[]} />);
  expect(container.querySelector('.SiteFooter__wordmark')).toHaveAttribute('aria-hidden', 'true');
});
