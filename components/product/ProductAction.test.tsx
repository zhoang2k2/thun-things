import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductAction } from '@/components/product/ProductAction';
import { StatusBadge } from '@/components/product/StatusBadge';
import { renderWithClientIntl } from '@/test/renderWithIntl';

describe('ProductAction', () => {
  it('renders nothing for sold-out products', () => {
    const { container } = renderWithClientIntl(<ProductAction slug="am-ban" status="sold_out" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('asks first for coming-soon products', () => {
    renderWithClientIntl(<ProductAction slug="mua-nang" status="coming_soon" />);
    expect(screen.getByRole('link', { name: 'Hỏi trước' })).toHaveAttribute(
      'href',
      '/contact?product=mua-nang&purpose=notify',
    );
  });

  it('orders available products through the contact fallback', () => {
    renderWithClientIntl(<ProductAction slug="hoang-hon-01" status="available" />);
    expect(screen.getByRole('link', { name: 'Đặt mua' })).toHaveAttribute(
      'href',
      '/contact?product=hoang-hon-01&purpose=order',
    );
  });
});

describe('StatusBadge', () => {
  it('labels the status', () => {
    renderWithClientIntl(<StatusBadge status="limited" />);
    expect(screen.getByText('Số lượng giới hạn')).toHaveClass('Badge--accent');
  });
});
