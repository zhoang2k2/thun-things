import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { ErrorState } from '@/components/layout/ErrorState';
import GlobalError from '@/app/global-error';
import RouteError from '@/app/error';
import NotFound from '@/app/not-found';
import { messages, renderWithClientIntl, renderWithIntl } from '@/test/renderWithIntl';

const { errors } = messages;

it('renders a single h1, the body and the action slot', () => {
  render(
    <ErrorState title="Tiêu đề" body="Nội dung">
      <a href="/x">Đi</a>
    </ErrorState>,
  );
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(screen.getByText('Nội dung')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Đi' })).toBeInTheDocument();
});

it('not-found has one h1 and links to home and contact', () => {
  renderWithIntl(<NotFound />);
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(errors.notFound.title);
  expect(screen.getByRole('link', { name: errors.notFound.home })).toHaveAttribute('href', '/');
  expect(screen.getByRole('link', { name: errors.notFound.contact })).toHaveAttribute(
    'href',
    '/contact',
  );
});

it('error page retries and never shows the error details', async () => {
  const retry = vi.fn();
  const error = Object.assign(new Error('secret detail'), { digest: 'digest-123' });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  renderWithClientIntl(<RouteError error={error} retry={retry} />);
  expect(screen.queryByText(/secret detail/)).not.toBeInTheDocument();
  expect(screen.queryByText(/digest-123/)).not.toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  await userEvent.click(screen.getByRole('button', { name: errors.generic.retry }));
  expect(retry).toHaveBeenCalledTimes(1);
});

it('global error renders a retry button without the error details', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  // Its copy loads lazily, so let the import settle inside act.
  await act(async () => {
    render(<GlobalError error={new Error('secret detail')} retry={() => {}} />, {
      container: document.documentElement,
    });
  });
  expect(await screen.findByRole('button', { name: errors.generic.retry })).toBeInTheDocument();
  expect(screen.queryByText(/secret detail/)).not.toBeInTheDocument();
});
