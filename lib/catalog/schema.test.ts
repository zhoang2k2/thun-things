import { describe, expect, it } from 'vitest';

import { catalogSchema, productSchema } from '@/lib/catalog/schema';

const image = { width: 1600, height: 2000, alt: { vi: 'Ảnh áo', en: 'Tee photo' } };

const validProduct = {
  id: 'tt-001',
  slug: 'hoang-hon-01',
  name: { vi: 'Hoàng Hôn 01', en: 'Sunset 01' },
  description: { vi: 'Mô tả', en: 'Description' },
  priceVND: 350000,
  status: 'available',
  colors: [{ id: 'white', label: { vi: 'Trắng', en: 'White' }, hex: '#F5F5F2' }],
  vibes: ['minimal'],
  media: { front: { ...image, src: '/products/hoang-hon-01/front.jpg' } },
};

describe('productSchema', () => {
  it('accepts a valid product', () => {
    expect(productSchema.safeParse(validProduct).success).toBe(true);
  });

  it('accepts an image without src (renders the placeholder)', () => {
    expect(productSchema.safeParse({ ...validProduct, media: { front: image } }).success).toBe(
      true,
    );
  });

  it('rejects a non-integer or negative price', () => {
    expect(productSchema.safeParse({ ...validProduct, priceVND: 350000.5 }).success).toBe(false);
    expect(productSchema.safeParse({ ...validProduct, priceVND: -1 }).success).toBe(false);
  });

  it('rejects an unknown status', () => {
    expect(productSchema.safeParse({ ...validProduct, status: 'discontinued' }).success).toBe(
      false,
    );
  });

  it('rejects a malformed colour hex', () => {
    const colors = [{ id: 'red', label: { vi: 'Đỏ', en: 'Red' }, hex: 'red' }];
    expect(productSchema.safeParse({ ...validProduct, colors }).success).toBe(false);
  });
});

describe('catalogSchema', () => {
  it('rejects duplicate slugs', () => {
    const copy = { ...validProduct, id: 'tt-002' };
    expect(catalogSchema.safeParse([validProduct, copy]).success).toBe(false);
  });

  it('rejects duplicate ids', () => {
    const copy = { ...validProduct, slug: 'hoang-hon-02' };
    expect(catalogSchema.safeParse([validProduct, copy]).success).toBe(false);
  });
});
