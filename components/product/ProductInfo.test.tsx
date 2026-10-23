import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductInfo } from '@/components/product/ProductInfo';
import { getAllSlugs, getProductBySlug } from '@/lib/catalog';

const firstWith = (status: string) =>
  getAllSlugs()
    .map((slug) => getProductBySlug(slug)!)
    .find((product) => product.status === status)!;

describe('ProductInfo', () => {
  it('shows the order action for available products', () => {
    const product = firstWith('available');
    render(<ProductInfo product={product} />);
    expect(screen.getByRole('heading', { level: 1, name: product.name.vi })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Đặt mua' })).toHaveAttribute(
      'href',
      `/contact?product=${product.slug}&purpose=order`,
    );
    expect(screen.queryByRole('link', { name: 'Báo khi có hàng' })).not.toBeInTheDocument();
  });

  it('offers notify-me for sold-out products', () => {
    const product = firstWith('sold_out');
    render(<ProductInfo product={product} />);
    expect(screen.getByText('Hết hàng')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Báo khi có hàng' })).toHaveAttribute(
      'href',
      `/contact?product=${product.slug}&purpose=notify`,
    );
  });

  it('lists sizes, material, and care', () => {
    const product = firstWith('available');
    render(<ProductInfo product={product} />);
    for (const size of product.sizes ?? []) expect(screen.getByText(size)).toBeInTheDocument();
    expect(screen.getByText(product.material!.vi)).toBeInTheDocument();
    expect(screen.getByText(product.care!.vi)).toBeInTheDocument();
  });
});
