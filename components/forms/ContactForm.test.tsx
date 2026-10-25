import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContactForm } from '@/components/forms/ContactForm';
import type { FormState } from '@/lib/leads/formState';
import type { ContactFormPrefill } from '@/lib/leads/prefill';
import { messages, renderWithFormIntl } from '@/test/renderWithIntl';

const submitContact = vi.hoisted(() =>
  vi.fn<(previous: FormState, formData: FormData) => Promise<FormState>>(),
);
vi.mock('@/lib/leads/actions', () => ({ submitContact }));

const { forms } = messages;

const prefillOf = (prefill: ContactFormPrefill) => Promise.resolve(prefill);
const ORDER = prefillOf({ purpose: 'order' });

// The prefill promise suspends the first render; awaiting act lets it resolve.
const renderForm = async (ui: ReactElement) => {
  await act(async () => {
    renderWithFormIntl(ui);
  });
};

beforeEach(() => {
  submitContact.mockReset();
});

describe('ContactForm', () => {
  it('marks email, phone and consent as required and checks the prefilled purpose', async () => {
    await renderForm(<ContactForm enabled prefill={ORDER} />);
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/^Số điện thoại/)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/^Tên/)).not.toHaveAttribute('aria-required');
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: forms.purposes.order })).toBeChecked(),
    );
    expect(screen.getByRole('link', { name: forms.fields.consentLink })).toHaveAttribute(
      'href',
      '/vi/policy/privacy',
    );
  });

  it('offers the product sizes and sends the product slug', async () => {
    submitContact.mockResolvedValue({ status: 'success' });
    await renderForm(
      <ContactForm
        enabled
        prefill={prefillOf({ purpose: 'preorder', productSlug: 'am-ban', sizes: ['S', 'M'] })}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: forms.purposes.preorder })).toBeChecked(),
    );
    const size = await screen.findByRole('combobox', { name: /^Size/ });
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

  it('uses a free-text size without a product', async () => {
    await renderForm(<ContactForm enabled prefill={prefillOf({ purpose: 'other' })} />);
    expect(await screen.findByRole('textbox', { name: /^Size/ })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: forms.purposes.other })).toBeChecked(),
    );
  });

  it('shows field errors linked to their inputs and focuses the summary', async () => {
    submitContact.mockResolvedValue({
      status: 'error',
      fieldErrors: { email: 'forms.errors.emailInvalid', phone: 'forms.errors.phoneRequired' },
      values: { email: 'khach@', name: 'Lan', purpose: 'order' },
    });
    await renderForm(<ContactForm enabled prefill={ORDER} />);
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
    submitContact.mockResolvedValue({ status: 'error', message: 'forms.rateLimited', values: {} });
    await renderForm(<ContactForm enabled prefill={ORDER} />);
    await userEvent.click(screen.getByRole('button', { name: forms.submit }));
    expect(await screen.findByText(forms.rateLimited)).toBeInTheDocument();
  });

  it('replaces the form with a confirmation on success', async () => {
    submitContact.mockResolvedValue({ status: 'success' });
    await renderForm(<ContactForm enabled prefill={ORDER} />);
    await userEvent.click(screen.getByRole('button', { name: forms.submit }));
    const success = await screen.findByRole('status');
    expect(success).toHaveTextContent(forms.contact.successTitle);
    await waitFor(() => expect(success).toHaveFocus());
    expect(screen.queryByRole('button', { name: forms.submit })).not.toBeInTheDocument();
  });

  it('renders a disabled form with a note and no submit button', async () => {
    await renderForm(
      <ContactForm enabled={false} prefill={ORDER} contactEmail="shop@example.com" />,
    );
    expect(await screen.findByText(forms.disabled)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'shop@example.com' })).toHaveAttribute(
      'href',
      'mailto:shop@example.com',
    );
    expect(screen.getByLabelText(/^Email/)).toBeDisabled();
    expect(screen.queryByRole('button', { name: forms.submit })).not.toBeInTheDocument();
  });
});

it('posts the page locale and translates server field errors in English', async () => {
  submitContact.mockResolvedValue({
    status: 'error',
    fieldErrors: { email: 'forms.errors.emailRequired' },
  });
  await act(async () => {
    renderWithFormIntl(<ContactForm enabled prefill={ORDER} />, { locale: 'en' });
  });
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(submitContact).toHaveBeenCalled());
  expect(submitContact.mock.calls[0][1].get('locale')).toBe('en');
  expect(
    await screen.findByText('Enter your email.', { selector: '[id$="email-error"]' }),
  ).toBeInTheDocument();
});
