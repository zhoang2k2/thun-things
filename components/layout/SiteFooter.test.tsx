import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ConsentProvider } from '@/components/consent/ConsentProvider';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { renderWithIntl } from '@/test/renderWithIntl';

// The footer's cookie-settings button needs the consent context the site frame provides.
const renderFooter = (ui: React.ReactElement) =>
  renderWithIntl(<ConsentProvider>{ui}</ConsentProvider>);

const policies = [
  { href: '/policy/privacy', label: 'Bảo mật' },
  { href: '/policy/returns', label: 'Đổi trả' },
];

it('renders policy links', () => {
  renderFooter(<SiteFooter policies={policies} socials={[]} />);
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Bảo mật' })).toHaveAttribute(
    'href',
    '/vi/policy/privacy',
  );
  expect(screen.getByRole('link', { name: 'Đổi trả' })).toHaveAttribute(
    'href',
    '/vi/policy/returns',
  );
  expect(screen.getByRole('button', { name: 'Cài đặt cookie' })).toBeInTheDocument();
});

it('hides email and socials when unset', () => {
  const { container } = renderFooter(<SiteFooter policies={policies} socials={[]} />);
  expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  expect(screen.queryByText('Mạng xã hội')).not.toBeInTheDocument();
  expect(screen.queryByText('Email')).not.toBeInTheDocument();
});

it('shows email and socials when set', () => {
  renderFooter(
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
  const { container } = renderFooter(<SiteFooter policies={policies} socials={[]} />);
  expect(container.querySelector('.SiteFooter__wordmark')).toHaveAttribute('aria-hidden', 'true');
});
