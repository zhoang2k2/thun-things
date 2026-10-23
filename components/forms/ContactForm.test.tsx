import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContactForm } from '@/components/forms/ContactForm';
import { copy } from '@/content/copy/vi';
import type { FormState } from '@/lib/leads/formState';

const submitContact = vi.hoisted(() =>
  vi.fn<(previous: FormState, formData: FormData) => Promise<FormState>>(),
);
vi.mock('@/lib/leads/actions', () => ({ submitContact }));

const { forms } = copy;

beforeEach(() => {
  submitContact.mockReset();
});

describe('ContactForm', () => {
  it('marks email, phone and consent as required and checks the default purpose', () => {
    render(<ContactForm enabled defaultPurpose="order" />);
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/^Số điện thoại/)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/^Tên/)).not.toHaveAttribute('aria-required');
    expect(screen.getByRole('radio', { name: forms.purposes.order })).toBeChecked();
    expect(screen.getByRole('link', { name: forms.fields.consentLink })).toHaveAttribute(
      'href',
      '/policy/privacy',
    );
  });

  it('offers the product sizes and sends the product slug', async () => {
    submitContact.mockResolvedValue({ status: 'success' });
    render(<ContactForm enabled defaultPurpose="notify" productSlug="am-ban" sizes={['S', 'M']} />);
    expect(screen.getByRole('radio', { name: forms.purposes.notify })).toBeChecked();
    const size = screen.getByRole('combobox', { name: /^Size/ });
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      forms.fields.sizePlaceholder,
      'S',
      'M',
    ]);
    await userEvent.selectOptions(size, 'M');
    await userEvent.click(screen.getByRole('button', { name: forms.submit }));
    await waitFor(() => expect(submitContact).toHaveBeenCalled());
    const data = submitContact.mock.calls[0][1];
    expect(data.get('productSlug')).toBe('am-ban');
    expect(data.get('size')).toBe('M');
    expect(data.get('website')).toBe('');
  });

  it('uses a free-text size without a product', () => {
    render(<ContactForm enabled defaultPurpose="other" />);
    expect(screen.getByRole('textbox', { name: /^Size/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: forms.purposes.other })).toBeChecked();
  });

  it('shows field errors linked to their inputs and focuses the summary', async () => {
    submitContact.mockResolvedValue({
      status: 'error',
      fieldErrors: { email: forms.errors.emailInvalid, phone: forms.errors.phoneRequired },
      values: { email: 'khach@', name: 'Lan', purpose: 'order' },
    });
    render(<ContactForm enabled defaultPurpose="order" />);
    await userEvent.click(screen.getByRole('button', { name: forms.submit }));

    const summary = await screen.findByText(forms.errorSummary);
    await waitFor(() => expect(summary.parentElement).toHaveFocus());

    const email = screen.getByLabelText(/^Email/);
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(forms.errors.emailInvalid);
    expect(email).toHaveValue('khach@');
    expect(screen.getByLabelText(/^Tên/)).toHaveValue('Lan');
    expect(screen.getByLabelText(/^Số điện thoại/)).toHaveAccessibleDescription(
      forms.errors.phoneRequired,
    );
    expect(screen.getByRole('link', { name: forms.errors.emailInvalid })).toHaveAttribute(
      'href',
      '#contact-email',
    );
  });

  it('shows a form-level message such as the rate limit', async () => {
    submitContact.mockResolvedValue({ status: 'error', message: forms.rateLimited, values: {} });
    render(<ContactForm enabled defaultPurpose="order" />);
    await userEvent.click(screen.getByRole('button', { name: forms.submit }));
    expect(await screen.findByText(forms.rateLimited)).toBeInTheDocument();
  });

  it('replaces the form with a confirmation on success', async () => {
    submitContact.mockResolvedValue({ status: 'success' });
    render(<ContactForm enabled defaultPurpose="order" />);
    await userEvent.click(screen.getByRole('button', { name: forms.submit }));
    const success = await screen.findByRole('status');
    expect(success).toHaveTextContent(forms.contact.successTitle);
    await waitFor(() => expect(success).toHaveFocus());
    expect(screen.queryByRole('button', { name: forms.submit })).not.toBeInTheDocument();
  });

  it('renders a disabled form with a note and no submit button', () => {
    render(<ContactForm enabled={false} defaultPurpose="order" contactEmail="shop@example.com" />);
    expect(screen.getByText(forms.disabled)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'shop@example.com' })).toHaveAttribute(
      'href',
      'mailto:shop@example.com',
    );
    expect(screen.getByLabelText(/^Email/)).toBeDisabled();
    expect(screen.queryByRole('button', { name: forms.submit })).not.toBeInTheDocument();
  });
});
