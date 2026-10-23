import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProductInfo } from '@/components/product/ProductInfo';
import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { renderWithIntl } from '@/test/renderWithIntl';

vi.mock('@/lib/leads/actions', () => ({ submitNotify: vi.fn() }));

const firstWith = (status: string) =>
  getAllSlugs()
    .map((slug) => getProductBySlug(slug)!)
    .find((product) => product.status === status)!;

describe('ProductInfo', () => {
  it('shows the order action for available products', () => {
    const product = firstWith('available');
    renderWithIntl(<ProductInfo product={product} />);
    expect(screen.getByRole('heading', { level: 1, name: product.name.vi })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Đặt mua' })).toHaveAttribute(
      'href',
      `/vi/contact?product=${product.slug}&purpose=order`,
    );
    expect(screen.queryByRole('heading', { name: 'Báo khi có hàng' })).not.toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('shows the in-page notify-me form for sold-out products', () => {
    const product = firstWith('sold_out');
    const { container } = renderWithIntl(<ProductInfo product={product} />);
    expect(screen.getByText('Hết hàng')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Báo khi có hàng' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Số điện thoại / Zalo')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(container.querySelector('input[name="productSlug"]')).toHaveValue(product.slug);
    expect(screen.queryByRole('link', { name: 'Đặt mua' })).not.toBeInTheDocument();
  });

  it('lists sizes, material, and care', () => {
    const product = firstWith('available');
    renderWithIntl(<ProductInfo product={product} />);
    for (const size of product.sizes ?? []) expect(screen.getByText(size)).toBeInTheDocument();
    expect(screen.getByText(product.material!.vi)).toBeInTheDocument();
    expect(screen.getByText(product.care!.vi)).toBeInTheDocument();
  });
});
