import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductAction } from '@/components/product/ProductAction';
import { StatusBadge } from '@/components/product/StatusBadge';

describe('ProductAction', () => {
  it('renders nothing for sold-out products', () => {
    const { container } = render(<ProductAction slug="am-ban" status="sold_out" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('asks first for coming-soon products', () => {
    render(<ProductAction slug="mua-nang" status="coming_soon" />);
    expect(screen.getByRole('link', { name: 'Hỏi trước' })).toHaveAttribute(
      'href',
      '/contact?product=mua-nang&purpose=notify',
    );
  });

  it('orders available products through the contact fallback', () => {
    render(<ProductAction slug="hoang-hon-01" status="available" />);
    expect(screen.getByRole('link', { name: 'Đặt mua' })).toHaveAttribute(
      'href',
      '/contact?product=hoang-hon-01&purpose=order',
    );
  });
});

describe('StatusBadge', () => {
  it('labels the status', () => {
    render(<StatusBadge status="limited" />);
    expect(screen.getByText('Số lượng giới hạn')).toHaveClass('Badge--accent');
  });
});
