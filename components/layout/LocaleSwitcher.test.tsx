import { render, screen, within } from '@testing-library/react';
import { usePathname, useSearchParams, useSelectedLayoutSegment } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { pickClientMessages } from '@/i18n/clientMessages';
import { messages, renderWithClientIntl } from '@/test/renderWithIntl';

const at = (pathname: string, query = '') => {
  vi.mocked(usePathname).mockReturnValue(pathname);
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(query) as unknown as ReadonlyURLSearchParams,
  );
};

const links = () => {
  const nav = screen.getByRole('navigation', { name: 'Ngôn ngữ' });
  return {
    vi: within(nav).getByRole('link', { name: 'Tiếng Việt' }),
    en: within(nav).getByRole('link', { name: 'English' }),
  };
};

afterEach(() => {
  at('/vi');
  vi.mocked(useSelectedLayoutSegment).mockReturnValue(null);
});

describe('LocaleSwitcher', () => {
  it('shows VI and EN as text and marks the current locale', () => {
    at('/vi/about');
    renderWithClientIntl(<LocaleSwitcher />);
    const { vi: viLink, en } = links();
    expect(viLink).toHaveTextContent('VI');
    expect(en).toHaveTextContent('EN');
    expect(viLink).toHaveAttribute('aria-current', 'true');
    expect(en).not.toHaveAttribute('aria-current');
    expect(viLink).toHaveAttribute('lang', 'vi');
    expect(en).toHaveAttribute('lang', 'en');
  });

  it('keeps the path and query on /vi/contact?product=x', () => {
    at('/vi/contact', 'product=x');
    renderWithClientIntl(<LocaleSwitcher />);
    expect(links().en).toHaveAttribute('href', '/en/contact?product=x');
    expect(links().vi).toHaveAttribute('href', '/vi/contact?product=x');
  });

  it('links back from /en/contact?product=x', () => {
    at('/en/contact', 'product=x');
    render(
      <NextIntlClientProvider locale="en" messages={pickClientMessages(messages)}>
        <LocaleSwitcher />
      </NextIntlClientProvider>,
    );
    expect(links().vi).toHaveAttribute('href', '/vi/contact?product=x');
    expect(links().en).toHaveAttribute('aria-current', 'true');
  });

  it('links each Home on Home', () => {
    at('/vi');
    vi.mocked(useSelectedLayoutSegment).mockReturnValue(null);
    renderWithClientIntl(<LocaleSwitcher />);
    expect(links().vi).toHaveAttribute('href', '/vi');
    expect(links().en).toHaveAttribute('href', '/en');
  });

  it('uses a fixed path when given one, ignoring the current URL', () => {
    at('/fr/missing', 'a=1');
    renderWithClientIntl(<LocaleSwitcher pathname="/" />);
    expect(links().vi).toHaveAttribute('href', '/vi');
    expect(links().en).toHaveAttribute('href', '/en');
  });
});

it('offers Home links on the rewritten locale 404', () => {
  at('/en/missing');
  vi.mocked(useSelectedLayoutSegment).mockReturnValue('not-found-page');
  renderWithClientIntl(<LocaleSwitcher />);
  expect(links().vi).toHaveAttribute('href', '/vi');
  expect(links().en).toHaveAttribute('href', '/en');
});

it('falls back to path-only links while the query is unavailable', () => {
  at('/vi/contact');
  vi.mocked(useSearchParams).mockImplementation(() => {
    throw new Promise(() => {});
  });
  renderWithClientIntl(<LocaleSwitcher />);
  expect(links().en).toHaveAttribute('href', '/en/contact');
});
