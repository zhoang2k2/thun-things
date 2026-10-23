import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { MediaImage } from '@/components/media/MediaImage';

it('renders a placeholder when src is missing', () => {
  render(<MediaImage alt="Áo thun trắng" width={1600} height={2000} />);
  const placeholder = screen.getByRole('img', { name: 'Áo thun trắng' });
  expect(placeholder).toHaveClass('ImagePlaceholder');
  expect(placeholder).toHaveStyle({ aspectRatio: '1600 / 2000' });
  expect(screen.getByText('Image')).toHaveClass('font-bold');
});

it('renders the real image when src is set', () => {
  const { container } = render(
    <MediaImage src="/products/tee.jpg" alt="Áo thun trắng" width={1600} height={2000} />,
  );
  expect(container.querySelector('img')).toHaveAttribute('alt', 'Áo thun trắng');
  expect(container.querySelector('.ImagePlaceholder')).toBeNull();
});
