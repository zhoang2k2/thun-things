import { describe, expect, it } from 'vitest';

import { getProductBySlug } from '@/lib/catalog';
import { customerEmailHtml, escapeHtml, ownerEmailHtml } from '@/lib/leads/emailHtml';
import type { Lead } from '@/lib/leads/types';
import en from '@/messages/en.json';
import vi from '@/messages/vi.json';

const product = getProductBySlug('hoang-hon-01')!;
const SITE = 'https://thun-things.vercel.app';

const LEAD: Lead = {
  purpose: 'order',
  email: 'khach@example.com',
  phone: '+84912345678',
  name: 'Lan',
  size: 'M',
  quantity: 2,
  address: '12 Lý Thường Kiệt, Hà Nội',
  message: 'Giao giờ hành chính\nCảm ơn shop',
  productId: product.id,
  productSlug: product.slug,
  locale: 'vi',
  consent: true,
  createdAt: '2026-10-23T08:00:00.000Z',
};

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    );
  });
});

describe('ownerEmailHtml', () => {
  const html = ownerEmailHtml(LEAD, product, SITE);

  it('leads with the purpose and the product, linking to its page', () => {
    expect(html).toContain(vi.forms.purposes.order);
    expect(html).toContain(product.name.vi);
    expect(html).toContain(`href="${SITE}/vi/products/${product.slug}"`);
    expect(html).toContain('390.000');
  });

  it('makes the contact details tappable', () => {
    expect(html).toContain('href="mailto:khach@example.com"');
    expect(html).toContain('href="tel:+84912345678"');
    expect(html).toContain('href="https://zalo.me/0912345678"');
  });

  it('keeps the message line breaks and the request details', () => {
    expect(html).toContain('Giao giờ hành chính<br>Cảm ơn shop');
    expect(html).toContain('12 Lý Thường Kiệt, Hà Nội');
    expect(html).toContain(`${vi.forms.fields.size}`);
    expect(html).toContain(vi.forms.email.consentGiven);
  });

  it('shows the product photo only when it has a real source', () => {
    expect(html).not.toContain('<img');
    const withPhoto = {
      ...product,
      media: { ...product.media, front: { ...product.media.front, src: '/products/hh01.jpg' } },
    };
    expect(ownerEmailHtml(LEAD, withPhoto, SITE)).toContain(`src="${SITE}/products/hh01.jpg"`);
  });

  it('escapes every visitor value', () => {
    const hostile = ownerEmailHtml(
      {
        ...LEAD,
        name: '<script>alert(1)</script>',
        message: '"><img src=x onerror=alert(1)>',
        address: "javascript:alert('x')",
      },
      product,
      SITE,
    );
    expect(hostile).not.toContain('<script>');
    expect(hostile).not.toContain('<img src=x');
    expect(hostile).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(hostile).not.toMatch(/href="javascript:/i);
  });

  it('never links an email address that is not an address', () => {
    const odd = ownerEmailHtml({ ...LEAD, email: 'a"b@example.com' }, product, SITE);
    expect(odd).not.toContain('mailto:a"b');
  });

  it('lets long values wrap instead of widening the email on phones', () => {
    const cells = html.match(/<td style="padding:4px 0;[^"]*"/g) ?? [];
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) expect(cell).toContain('overflow-wrap:anywhere');
  });

  it('works without a product or optional fields', () => {
    const bare = ownerEmailHtml(
      {
        purpose: 'other',
        email: 'a@b.co',
        locale: 'vi',
        consent: true,
        createdAt: LEAD.createdAt,
      },
      undefined,
      SITE,
    );
    expect(bare).toContain(vi.forms.purposes.other);
    expect(bare).not.toContain('tel:');
  });
});

describe('pre-order leads (P9a2)', () => {
  it('names the pre-order and its discount in the owner email', () => {
    const html = ownerEmailHtml({ ...LEAD, purpose: 'preorder' }, product, SITE);
    expect(html).toContain(vi.forms.purposes.preorder);
    expect(html).toContain(vi.forms.email.preorderOffer);
  });

  it('leaves the discount out of other purposes', () => {
    expect(ownerEmailHtml(LEAD, product, SITE)).not.toContain(vi.forms.email.preorderOffer);
  });
});

describe('customerEmailHtml', () => {
  it('writes to a Vietnamese visitor in Vietnamese', () => {
    const html = customerEmailHtml(LEAD, product, SITE);
    expect(html).toContain('lang="vi"');
    expect(html).toContain(vi.forms.email.greeting);
    expect(html).toContain(vi.forms.contact.successBody);
    expect(html).toContain(product.name.vi);
  });

  it('writes to an English visitor in English, with the English product page', () => {
    const html = customerEmailHtml({ ...LEAD, locale: 'en', purpose: 'preorder' }, product, SITE);
    expect(html).toContain('lang="en"');
    expect(html).toContain(en.forms.email.greeting);
    expect(html).toContain(escapeHtml(en.forms.contact.successBody));
    expect(html).toContain(en.forms.purposes.preorder);
    expect(html).toContain(product.name.en);
    expect(html).toContain(`href="${SITE}/en/products/${product.slug}"`);
  });

  it('never repeats the visitor’s contact details or message', () => {
    const html = customerEmailHtml(LEAD, product, SITE);
    expect(html).not.toContain('+84912345678');
    expect(html).not.toContain('Giao giờ');
  });
});
