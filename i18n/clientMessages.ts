import type { Messages } from '@/i18n/messages';

/**
 * The only messages every page sends to the browser: what the always-present Client Components
 * (and the shared components they render) translate. Page copy, metadata and the email
 * templates (`forms.email`) stay on the server; form copy goes only to pages with a form
 * (`pickFormMessages`).
 */
export const pickClientMessages = ({
  localeSwitcher,
  media,
  hero,
  product,
  errors,
  consent,
  footer,
  quiz,
}: Messages) => ({
  localeSwitcher,
  consent,
  quiz,
  footer: { cookieSettings: footer.cookieSettings },
  media,
  hero,
  product: {
    galleryLabel: product.galleryLabel,
    status: product.status,
    actions: product.actions,
    preorderOffer: product.preorderOffer,
    lensBackPlaceholder: product.lensBackPlaceholder,
  },
  errors: { generic: errors.generic, notFound: { home: errors.notFound.home } },
});

/**
 * Messages for a nested provider around a form (the Contact page). A nested
 * `NextIntlClientProvider` replaces its parent's messages, so this subset must cover everything
 * rendered inside the form.
 */
export const pickFormMessages = ({ forms }: Messages) => ({
  forms: {
    required: forms.required,
    submit: forms.submit,
    sending: forms.sending,
    errorSummary: forms.errorSummary,
    honeypotLabel: forms.honeypotLabel,
    disabled: forms.disabled,
    disabledEmail: forms.disabledEmail,
    rateLimited: forms.rateLimited,
    deliveryFailed: forms.deliveryFailed,
    errors: forms.errors,
    fields: forms.fields,
    purposes: forms.purposes,
    contact: forms.contact,
  },
});
