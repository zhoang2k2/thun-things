import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotifyForm } from '@/components/forms/NotifyForm';
import type { FormState } from '@/lib/leads/formState';
import { messages, renderWithClientIntl } from '@/test/renderWithIntl';

const submitNotify = vi.hoisted(() =>
  vi.fn<(previous: FormState, formData: FormData) => Promise<FormState>>(),
);
vi.mock('@/lib/leads/actions', () => ({ submitNotify }));

const { forms } = messages;

beforeEach(() => {
  submitNotify.mockReset();
});

describe('NotifyForm', () => {
  it('shows the email-or-phone error from the server on the email field', async () => {
    submitNotify.mockResolvedValue({
      status: 'error',
      fieldErrors: { email: 'forms.errors.contactRequired' },
      values: { email: '', phone: '', productSlug: 'am-ban' },
    });
    renderWithClientIntl(<NotifyForm productSlug="am-ban" enabled />);
    await userEvent.click(screen.getByRole('button', { name: forms.notify.submit }));
    const email = await screen.findByLabelText('Email');
    await waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'true'));
    expect(email).toHaveAccessibleDescription(forms.errors.contactRequired);
    const data = submitNotify.mock.calls[0][1];
    expect(data.get('productSlug')).toBe('am-ban');
  });

  it('replaces the form with an inline confirmation', async () => {
    submitNotify.mockResolvedValue({ status: 'success' });
    renderWithClientIntl(<NotifyForm productSlug="am-ban" enabled />);
    await userEvent.type(screen.getByLabelText('Email'), 'a@example.com');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: forms.notify.submit }));
    expect(await screen.findByRole('status')).toHaveTextContent(forms.notify.success);
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  });

  it('is disabled without configuration', () => {
    renderWithClientIntl(<NotifyForm productSlug="am-ban" enabled={false} />);
    expect(screen.getByText(forms.disabled)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
