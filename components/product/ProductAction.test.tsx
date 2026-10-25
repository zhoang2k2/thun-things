import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductAction } from '@/components/product/ProductAction';
import { ProductOrderBar } from '@/components/product/ProductOrderBar';
import { StatusBadge } from '@/components/product/StatusBadge';
import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { renderWithClientIntl } from '@/test/renderWithIntl';

const OFFER = 'Giảm đến 10% khi đặt trước';

describe('ProductAction', () => {
  it('orders in-stock designs through Contact', () => {
    renderWithClientIntl(<ProductAction slug="hoang-hon-01" status="available" />);
    expect(screen.getByRole('link', { name: 'Liên hệ đặt hàng' })).toHaveAttribute(
      'href',
      '/vi/contact?product=hoang-hon-01&purpose=order',
    );
    expect(screen.queryByText(OFFER)).not.toBeInTheDocument();
  });

  it('pre-orders sold-out designs with the discount line under the button', () => {
    renderWithClientIntl(<ProductAction slug="am-ban" status="sold_out" />);
    expect(screen.getByRole('link', { name: 'Liên hệ đặt trước' })).toHaveAttribute(
      'href',
      '/vi/contact?product=am-ban&purpose=preorder',
    );
    expect(screen.getByText(OFFER)).toBeInTheDocument();
  });

  it('can leave the discount line out (mobile order bar)', () => {
    renderWithClientIntl(<ProductAction slug="am-ban" status="sold_out" showOffer={false} />);
    expect(screen.getByRole('link', { name: 'Liên hệ đặt trước' })).toBeInTheDocument();
    expect(screen.queryByText(OFFER)).not.toBeInTheDocument();
  });

  it('speaks English on /en', () => {
    renderWithClientIntl(<ProductAction slug="am-ban" status="sold_out" />, { locale: 'en' });
    expect(screen.getByRole('link', { name: 'Contact to pre-order' })).toHaveAttribute(
      'href',
      '/en/contact?product=am-ban&purpose=preorder',
    );
    expect(screen.getByText('Up to 10% off when you pre-order')).toBeInTheDocument();
  });
});

describe('StatusBadge', () => {
  it.each([
    ['available', 'Còn hàng', 'Badge--neutral'],
    ['sold_out', 'Hết hàng', 'Badge--muted'],
  ] as const)('labels %s', (status, label, className) => {
    renderWithClientIntl(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toHaveClass(className);
  });
});

describe('ProductOrderBar', () => {
  it('offers pre-order on sold-out designs, without the discount line or a notify link', () => {
    const product = getAllSlugs()
      .map((slug) => getProductBySlug(slug)!)
      .find((item) => item.status === 'sold_out')!;
    const { container } = renderWithClientIntl(<ProductOrderBar product={product} />);
    expect(screen.getByRole('link', { name: 'Liên hệ đặt trước' })).toBeInTheDocument();
    expect(screen.queryByText(OFFER)).not.toBeInTheDocument();
    expect(container.querySelector('a[href="#notify"]')).toBeNull();
  });
});
