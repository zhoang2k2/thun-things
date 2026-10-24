import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getProductBySlug } from '@/lib/catalog';
import { customerEmailHtml, ownerEmailHtml } from '@/lib/leads/emailHtml';
import type { Lead } from '@/lib/leads/types';

// Visual preview of the lead emails for evidence and manual checks (P9a). Skipped in normal runs;
// `EMAIL_PREVIEW=1 pnpm vitest run lib/leads/emailPreview` writes HTML files to a git-ignored folder.
const OUT_DIR = join('.superpowers', 'email-preview');
const SITE = 'https://thun-things.vercel.app';
const product = getProductBySlug('hoang-hon-01')!;

const LEAD: Lead = {
  kind: 'contact',
  purpose: 'order',
  email: 'lan.nguyen@example.com',
  phone: '+84912345678',
  name: 'Nguyễn Lan',
  size: 'M',
  quantity: 2,
  address: '12 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
  message: 'Shop giao giờ hành chính giúp mình nhé.\nCảm ơn shop!',
  productId: product.id,
  productSlug: product.slug,
  locale: 'vi',
  consent: true,
  createdAt: '2026-10-24T08:00:00.000Z',
};

describe.runIf(process.env.EMAIL_PREVIEW === '1')('email preview', () => {
  it('writes the owner and customer emails', () => {
    mkdirSync(OUT_DIR, { recursive: true });
    const files = {
      'owner-vi.html': ownerEmailHtml(LEAD, product, SITE),
      'customer-vi.html': customerEmailHtml(LEAD, product, SITE),
      'customer-en.html': customerEmailHtml(
        { ...LEAD, locale: 'en', kind: 'notify', purpose: 'notify' },
        product,
        SITE,
      ),
    };
    for (const [name, html] of Object.entries(files)) writeFileSync(join(OUT_DIR, name), html);
    expect(Object.keys(files)).toHaveLength(3);
  });
});
