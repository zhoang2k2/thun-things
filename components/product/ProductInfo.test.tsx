import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductInfo } from '@/components/product/ProductInfo';
import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { renderWithIntl } from '@/test/renderWithIntl';

const firstWith = (status: string) =>
  getAllSlugs()
    .map((slug) => getProductBySlug(slug)!)
    .find((product) => product.status === status)!;

describe('ProductInfo', () => {
  it('shows the order action for available products', () => {
    const product = firstWith('available');
    renderWithIntl(<ProductInfo product={product} />);
    expect(screen.getByRole('heading', { level: 1, name: product.name.vi })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Liên hệ đặt hàng' })).toHaveAttribute(
      'href',
      `/vi/contact?product=${product.slug}&purpose=order`,
    );
    expect(screen.getByText('Còn hàng')).toBeInTheDocument();
  });

  it('offers pre-order with the discount line, and no notify-me form, when sold out', () => {
    const product = firstWith('sold_out');
    renderWithIntl(<ProductInfo product={product} />);
    expect(screen.getByText('Hết hàng')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Liên hệ đặt trước' })).toHaveAttribute(
      'href',
      `/vi/contact?product=${product.slug}&purpose=preorder`,
    );
    expect(screen.getByText('Giảm đến 10% khi đặt trước')).toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('lists sizes, material, and care', () => {
    const product = firstWith('available');
    renderWithIntl(<ProductInfo product={product} />);
    for (const size of product.sizes ?? []) expect(screen.getByText(size)).toBeInTheDocument();
    expect(screen.getByText(product.material!.vi)).toBeInTheDocument();
    expect(screen.getByText(product.care!.vi)).toBeInTheDocument();
  });
});

it('renders existing English product fields and English VND formatting', () => {
  const product = firstWith('available');
  renderWithIntl(<ProductInfo product={product} />, { locale: 'en' });
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(product.name.en);
  expect(screen.getByText(product.description.en)).toBeVisible();
  expect(screen.getByText(product.material!.en)).toBeVisible();
  expect(screen.getByText('₫390,000')).toBeVisible();
  expect(screen.getByRole('link', { name: 'Contact to order' })).toHaveAttribute(
    'href',
    `/en/contact?product=${product.slug}&purpose=order`,
  );
});
