import { screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { renderWithIntl } from '@/test/renderWithIntl';

const nav = [
  { href: '/about', label: 'Giới thiệu' },
  { href: '/contact', label: 'Liên hệ' },
];

it('renders a banner with locale-prefixed main navigation', () => {
  renderWithIntl(<SiteHeader nav={nav} />);
  const banner = screen.getByRole('banner');
  const navigation = within(banner).getByRole('navigation', { name: 'Điều hướng chính' });
  expect(within(navigation).getByRole('link', { name: 'Giới thiệu' })).toHaveAttribute(
    'href',
    '/vi/about',
  );
  expect(within(navigation).getByRole('link', { name: 'Liên hệ' })).toHaveAttribute(
    'href',
    '/vi/contact',
  );
  expect(within(banner).getByRole('link', { name: 'Thun Things' })).toHaveAttribute('href', '/vi');
});

it('renders the language switch in the banner', () => {
  renderWithIntl(<SiteHeader nav={nav} />);
  const switcher = within(screen.getByRole('banner')).getByRole('navigation', { name: 'Ngôn ngữ' });
  expect(within(switcher).getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en');
});

it('points the language switch at a fixed path when given one', () => {
  renderWithIntl(<SiteHeader nav={nav} switcherPathname="/" />);
  expect(screen.getByRole('link', { name: 'Tiếng Việt' })).toHaveAttribute('href', '/vi');
  expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en');
});
