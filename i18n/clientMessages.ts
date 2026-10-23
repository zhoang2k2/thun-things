import type { Messages } from '@/i18n/messages';

/**
 * The only messages sent to the browser: what Client Components (and the shared components
 * they render) translate. Everything else, such as page copy, metadata and the email
 * templates (`forms.email`), stays on the server.
 */
export const pickClientMessages = ({ media, hero, product, forms, errors }: Messages) => ({
  media,
  hero,
  product: {
    galleryLabel: product.galleryLabel,
    status: product.status,
    actions: product.actions,
  },
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
    unknownProduct: forms.unknownProduct,
    errors: forms.errors,
    fields: forms.fields,
    purposes: forms.purposes,
    contact: forms.contact,
    notify: forms.notify,
  },
  errors: { generic: errors.generic, notFound: { home: errors.notFound.home } },
});
