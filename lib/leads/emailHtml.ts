import { DEFAULT_LOCALE, getMessagesFor } from '@/i18n/messages';
import { type Locale, localizedPath } from '@/i18n/routing';
import { formatPriceVND } from '@/lib/catalog/format';
import type { Product } from '@/lib/catalog/schema';
import type { Lead } from '@/lib/leads/types';

// HTML lead emails (P9a spec section 1): inline styles and tables for mail clients, ink on white,
// square corners and flat colours (DR-1/DR-2). Every visitor value goes through `escapeHtml`, and
// links are built only from validated parts (https site URLs, mailto, tel, Zalo).

const INK = '#111111';
const MUTED = '#5c5c5c';
const LINE = '#d9d9d9';
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const EMAIL_ADDRESS = /^[^\s@"'<>()]+@[^\s@"'<>()]+\.[^\s@"'<>()]+$/;
const VN_PHONE = /^\+84(\d{9,10})$/;

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const multiline = (value: string) => escapeHtml(value).replace(/\r?\n/g, '<br>');

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
});

const productUrl = (product: Product, locale: Locale, siteUrl: string) =>
  new URL(localizedPath(locale, `/products/${product.slug}`), siteUrl).href;

const link = (href: string, label: string) =>
  `<a href="${escapeHtml(href)}" style="color:${INK};text-decoration:underline">${label}</a>`;

const heading = (text: string) =>
  `<p style="margin:24px 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED}">${escapeHtml(text)}</p>`;

const row = (label: string, value: string) =>
  `<tr><td style="padding:4px 16px 4px 0;color:${MUTED};vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:4px 0;color:${INK};overflow-wrap:anywhere;word-break:break-word">${value}</td></tr>`;

const table = (rows: string[]) =>
  rows.length === 0
    ? ''
    : `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px;line-height:24px">${rows.join('')}</table>`;

const layout = (locale: Locale, title: string, body: string) =>
  `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>` +
  `<body style="margin:0;padding:0;background:#ffffff;color:${INK};font-family:${FONT}">` +
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr><td align="center" style="padding:24px 16px">` +
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border:1px solid ${INK};border-collapse:collapse"><tr><td style="padding:32px 24px">` +
  body +
  `</td></tr></table></td></tr></table></body></html>`;

const productBlock = (product: Product, locale: Locale, siteUrl: string, withPrice: boolean) => {
  const url = productUrl(product, locale, siteUrl);
  const label = getMessagesFor(locale).forms.email.viewProduct;
  const src = product.media.front.src;
  const photo = src
    ? `<td width="96" style="padding:0 16px 0 0;vertical-align:top"><img src="${escapeHtml(new URL(src, siteUrl).href)}" width="96" alt="${escapeHtml(product.name[locale])}" style="display:block;width:96px;height:auto;border:1px solid ${LINE}"></td>`
    : '';
  const price = withPrice
    ? `<p style="margin:4px 0 0;font-size:15px">${escapeHtml(formatPriceVND(product.priceVND, locale))}</p>`
    : '';
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:16px"><tr>${photo}` +
    `<td style="vertical-align:top"><p style="margin:0;font-size:17px;font-weight:700">${escapeHtml(product.name[locale])}</p>${price}` +
    `<p style="margin:8px 0 0;font-size:15px">${link(url, escapeHtml(label))}</p></td></tr></table>`
  );
};

/** The shop's notification: purpose and product first, then tappable ways to reach the visitor. */
export const ownerEmailHtml = (lead: Lead, product: Product | undefined, siteUrl: string) => {
  const messages = getMessagesFor(DEFAULT_LOCALE);
  const { fields, purposes, email } = messages.forms;
  const purpose = purposes[lead.purpose];

  const details = table([
    ...(lead.size ? [row(fields.size, escapeHtml(lead.size))] : []),
    ...(lead.quantity !== undefined ? [row(fields.quantity, String(lead.quantity))] : []),
    row(email.locale, escapeHtml(lead.locale.toUpperCase())),
  ]);

  const phone = lead.phone && VN_PHONE.exec(lead.phone);
  const contact = table([
    ...(lead.email
      ? [
          row(
            fields.email,
            EMAIL_ADDRESS.test(lead.email)
              ? link(`mailto:${lead.email}`, escapeHtml(lead.email))
              : escapeHtml(lead.email),
          ),
        ]
      : []),
    ...(lead.phone
      ? [
          row(
            fields.phone,
            phone
              ? `${link(`tel:${lead.phone}`, escapeHtml(lead.phone))} · ${link(`https://zalo.me/0${phone[1]}`, escapeHtml(email.zalo))}`
              : escapeHtml(lead.phone),
          ),
        ]
      : []),
    ...(lead.name ? [row(fields.name, escapeHtml(lead.name))] : []),
    ...(lead.address ? [row(fields.address, escapeHtml(lead.address))] : []),
  ]);

  const message = lead.message
    ? heading(fields.message) +
      `<p style="margin:0;padding:12px 16px;border-left:2px solid ${INK};font-size:15px;line-height:24px">${multiline(lead.message)}</p>`
    : '';

  const body =
    `<p style="margin:0;font-size:24px;line-height:32px;font-weight:700">${escapeHtml(purpose)}</p>` +
    (product ? productBlock(product, DEFAULT_LOCALE, siteUrl, true) : '') +
    heading(email.detailsHeading) +
    details +
    heading(email.contactHeading) +
    contact +
    message +
    `<p style="margin:32px 0 0;padding-top:16px;border-top:1px solid ${LINE};font-size:13px;color:${MUTED}">${escapeHtml(timeFormatter.format(new Date(lead.createdAt)))} · ${escapeHtml(email.consentGiven)}</p>`;

  return layout(DEFAULT_LOCALE, purpose, body);
};

/** The visitor's confirmation, in the language of the page they used. No contact data echoed. */
export const customerEmailHtml = (lead: Lead, product: Product | undefined, siteUrl: string) => {
  const messages = getMessagesFor(lead.locale);
  const { purposes, email, notify, contact } = messages.forms;
  const body = lead.kind === 'notify' ? notify.success : contact.successBody;

  const html =
    `<p style="margin:0;font-size:17px">${escapeHtml(email.greeting)}</p>` +
    `<p style="margin:16px 0 0;font-size:15px;line-height:24px">${escapeHtml(body)}</p>` +
    heading(email.request) +
    `<p style="margin:0;font-size:15px">${escapeHtml(purposes[lead.purpose])}</p>` +
    (product ? productBlock(product, lead.locale, siteUrl, false) : '') +
    `<p style="margin:32px 0 0;padding-top:16px;border-top:1px solid ${LINE};font-size:15px;font-weight:700">${escapeHtml(messages.site.name)}</p>`;

  return layout(lead.locale, email.customerSubject, html);
};
