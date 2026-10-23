import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroSlideshow } from '@/components/home/HeroSlideshow';
import { banners } from '@/content/banners';

const stubReducedMotion = (reduce: boolean) => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: reduce && query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
};

const currentBar = () =>
  screen
    .getAllByRole('button', { name: /^Banner \d \/ 4$/ })
    .find((bar) => bar.getAttribute('aria-current') === 'true');

describe('HeroSlideshow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders one progress bar per banner', () => {
    render(<HeroSlideshow banners={banners} />);
    expect(banners).toHaveLength(4);
    expect(screen.getAllByRole('button', { name: /^Banner \d \/ 4$/ })).toHaveLength(4);
    expect(currentBar()).toHaveAccessibleName('Banner 1 / 4');
  });

  it('advances after the interval', () => {
    render(<HeroSlideshow banners={banners} />);
    act(() => vi.advanceTimersByTime(5000));
    expect(currentBar()).toHaveAccessibleName('Banner 2 / 4');
  });

  it('stops advancing when paused', () => {
    render(<HeroSlideshow banners={banners} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tạm dừng' }));
    act(() => vi.advanceTimersByTime(15000));
    expect(currentBar()).toHaveAccessibleName('Banner 1 / 4');
    expect(screen.getByRole('button', { name: 'Tiếp tục' })).toBeInTheDocument();
  });

  it('jumps to a banner from its progress bar', () => {
    render(<HeroSlideshow banners={banners} />);
    fireEvent.click(screen.getByRole('button', { name: 'Banner 3 / 4' }));
    expect(currentBar()).toHaveAccessibleName('Banner 3 / 4');
  });

  it('hides inactive slides from assistive technology', () => {
    render(<HeroSlideshow banners={banners} />);
    const slides = screen.getAllByRole('group', { hidden: true });
    expect(slides.filter((slide) => slide.getAttribute('aria-hidden') !== 'true')).toHaveLength(1);
  });

  it('starts paused when reduced motion is preferred', () => {
    stubReducedMotion(true);
    render(<HeroSlideshow banners={banners} />);
    act(() => vi.advanceTimersByTime(15000));
    expect(currentBar()).toHaveAccessibleName('Banner 1 / 4');
    expect(screen.getByRole('button', { name: 'Tiếp tục' })).toBeInTheDocument();
  });
});
