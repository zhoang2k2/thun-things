import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { renderWithIntl } from '@/test/renderWithIntl';

const policies = [
  { href: '/policy/privacy', label: 'Bảo mật' },
  { href: '/policy/returns', label: 'Đổi trả' },
];

it('renders policy links', () => {
  renderWithIntl(<SiteFooter policies={policies} socials={[]} />);
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Bảo mật' })).toHaveAttribute(
    'href',
    '/vi/policy/privacy',
  );
  expect(screen.getByRole('link', { name: 'Đổi trả' })).toHaveAttribute(
    'href',
    '/vi/policy/returns',
  );
});

it('hides email and socials when unset', () => {
  const { container } = renderWithIntl(<SiteFooter policies={policies} socials={[]} />);
  expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  expect(screen.queryByText('Mạng xã hội')).not.toBeInTheDocument();
  expect(screen.queryByText('Email')).not.toBeInTheDocument();
});

it('shows email and socials when set', () => {
  renderWithIntl(
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
  const { container } = renderWithIntl(<SiteFooter policies={policies} socials={[]} />);
  expect(container.querySelector('.SiteFooter__wordmark')).toHaveAttribute('aria-hidden', 'true');
});
