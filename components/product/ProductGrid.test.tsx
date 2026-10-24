import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Pagination } from '@/components/product/Pagination';
import { ProductGrid } from '@/components/product/ProductGrid';
import { listProducts, toCardModel } from '@/lib/catalog';
import { renderWithIntl } from '@/test/renderWithIntl';

const products = listProducts().items.map((product) => toCardModel(product));

describe('ProductGrid', () => {
  it('renders one image-only link per product', () => {
    renderWithIntl(<ProductGrid products={products} />);
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(20);
    const first = products[0];
    const link = within(list).getAllByRole('link', { name: new RegExp(first.name) })[0];
    expect(link).toHaveAttribute('href', `/vi/products/${first.slug}`);
    expect(screen.queryByText(first.priceLabel)).not.toBeInTheDocument();
  });
});

describe('Pagination', () => {
  it('marks the current page and links page 1 to the root', () => {
    renderWithIntl(<Pagination page={2} pageCount={2} />);
    const nav = screen.getByRole('navigation', { name: 'Phân trang' });
    expect(within(nav).getByRole('link', { name: 'Trang 1' })).toHaveAttribute('href', '/vi');
    expect(within(nav).getByRole('link', { name: 'Trang 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Trước' })).toHaveAttribute('href', '/vi');
    expect(within(nav).queryByRole('link', { name: 'Sau' })).not.toBeInTheDocument();
  });

  it('links forward from the first page', () => {
    renderWithIntl(<Pagination page={1} pageCount={2} />);
    expect(screen.getByRole('link', { name: 'Sau' })).toHaveAttribute('href', '/vi?page=2');
    expect(screen.queryByRole('link', { name: 'Trước' })).not.toBeInTheDocument();
  });

  it('renders nothing for a single page', () => {
    const { container } = renderWithIntl(<Pagination page={1} pageCount={1} />);
    expect(container).toBeEmptyDOMElement();
  });
});
