import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductGrid } from '@/components/product/ProductGrid';
import { getAllSlugs, getProductBySlug, toCardModel } from '@/lib/catalog';
import { renderWithClientIntl } from '@/test/renderWithIntl';

const byStatus = (status: string) =>
  toCardModel(
    getAllSlugs()
      .map((slug) => getProductBySlug(slug)!)
      .find((p) => p.status === status)!,
  );

const available = byStatus('available');
const soldOut = byStatus('sold_out');

const renderGrid = () => renderWithClientIntl(<ProductGrid products={[available, soldOut]} />);
const tileOf = (name: string) =>
  screen
    .getAllByRole('listitem')
    .find(
      (item) =>
        item.textContent?.includes(name) ||
        within(item).queryByRole('link', { name: new RegExp(name) }),
    )!;

describe('product hover card', () => {
  it('opens on hover with name, price, status, and action', async () => {
    renderGrid();
    const tile = tileOf(available.name);
    fireEvent.pointerEnter(tile, { pointerType: 'mouse', clientX: 10, clientY: 10 });
    const card = screen.getByTestId('product-hover-card');
    expect(within(card).getByText(available.name)).toBeInTheDocument();
    // vi-VN currency output uses a non-breaking space; the DOM matcher normalises it.
    expect(within(card).getByText(available.priceLabel.replace(/\s/g, ' '))).toBeInTheDocument();
    expect(within(card).getByText('Còn hàng')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Liên hệ đặt hàng' })).toBeInTheDocument();

    fireEvent.pointerLeave(tile, { pointerType: 'mouse' });
    await waitFor(() => expect(screen.queryByTestId('product-hover-card')).not.toBeInTheDocument());
  });

  it('offers pre-order with the discount line on sold-out products', () => {
    renderGrid();
    const tile = tileOf(soldOut.name);
    fireEvent.pointerEnter(tile, { pointerType: 'mouse' });
    const card = screen.getByTestId('product-hover-card');
    expect(within(card).getByText('Hết hàng')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Liên hệ đặt trước' })).toHaveAttribute(
      'href',
      `/vi/contact?product=${soldOut.slug}&purpose=preorder`,
    );
    expect(within(card).getByText('Giảm đến 10% khi đặt trước')).toBeInTheDocument();
  });

  it('opens on keyboard focus and closes on Escape', async () => {
    renderGrid();
    const tile = tileOf(available.name);
    const link = within(tile).getAllByRole('link')[0];
    fireEvent.focus(link);
    expect(screen.getByTestId('product-hover-card')).toBeInTheDocument();
    fireEvent.keyDown(link, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByTestId('product-hover-card')).not.toBeInTheDocument());
  });

  it('first touch tap opens the card without navigating', () => {
    renderGrid();
    const tile = tileOf(available.name);
    const link = within(tile).getAllByRole('link')[0];

    fireEvent.pointerDown(link, { pointerType: 'touch' });
    fireEvent.focus(link); // a real tap focuses the link before the click
    const firstTap = fireEvent.click(link);
    expect(firstTap).toBe(false); // default prevented
    expect(screen.getByTestId('product-hover-card')).toBeInTheDocument();

    fireEvent.pointerDown(link, { pointerType: 'touch' });
    expect(fireEvent.click(link)).toBe(true); // second tap follows the link
  });
});
