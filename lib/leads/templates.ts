import { DEFAULT_LOCALE, getMessagesFor } from '@/i18n/messages';
import { localizedPath } from '@/i18n/routing';
import { formatPriceVND } from '@/lib/catalog/format';
import type { Product } from '@/lib/catalog/schema';
import type { Lead } from '@/lib/leads/types';

// Plain-text emails in Vietnamese. The owner email is built to be scanned on a phone:
// purpose and product first, then the ways to reach the customer.

export interface EmailContent {
  subject: string;
  text: string;
}

const messages = getMessagesFor(DEFAULT_LOCALE);
const { fields, purposes, email } = messages.forms;
const SHOP = messages.site.name;

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
});

const line = (label: string, value: string | number | undefined): string[] =>
  value === undefined ? [] : [`${label}: ${value}`];

const productLines = (product: Product | undefined, siteUrl: string): string[] => {
  if (!product) return [];
  return [
    `${messages.forms.contact.productLabel}: ${product.name.vi} (${formatPriceVND(product.priceVND)})`,
    `${new URL(localizedPath(DEFAULT_LOCALE, `/products/${product.slug}`), siteUrl)}`,
  ];
};

export const ownerEmail = (lead: Lead, product: Product | undefined, siteUrl: string) => {
  const purpose = purposes[lead.purpose];
  const subject = product ? `[${SHOP}] ${purpose} — ${product.name.vi}` : `[${SHOP}] ${purpose}`;
  const text = [
    `${purpose}`,
    ...productLines(product, siteUrl),
    ...line(fields.size, lead.size),
    ...line(fields.quantity, lead.quantity),
    '',
    ...line(fields.email, lead.email),
    ...line(fields.phone, lead.phone),
    ...line(fields.name, lead.name),
    ...line(fields.address, lead.address),
    ...(lead.message ? ['', `${fields.message}:`, lead.message] : []),
    '',
    `${dateFormatter.format(new Date(lead.createdAt))} · ${email.consentGiven}`,
  ].join('\n');
  return { subject, text } satisfies EmailContent;
};

export const customerEmail = (lead: Lead, product: Product | undefined, siteUrl: string) => {
  const body =
    lead.kind === 'notify' ? messages.forms.notify.success : messages.forms.contact.successBody;
  const text = [
    email.greeting,
    '',
    body,
    '',
    `${email.request}: ${purposes[lead.purpose]}`,
    ...productLines(product, siteUrl),
    '',
    SHOP,
  ].join('\n');
  return { subject: email.customerSubject, text } satisfies EmailContent;
};
