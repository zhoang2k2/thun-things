import { act, fireEvent, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LiquidLens } from '@/components/product/LiquidLens';
import { listProducts, toCardModel } from '@/lib/catalog';
import { renderWithIntl } from '@/test/renderWithIntl';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('@/lib/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => motion.reduced,
}));

const products = listProducts().items.map((product) => toCardModel(product));

/** A wrapper like ProductGrid's, owning the ref the lens reads, with two tiles to enter. */
const Harness = ({ list }: { list: typeof products }) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} data-testid="wrapper" className="ProductGrid relative">
      <ul>
        <li className="ProductTile" data-testid="tile-a" />
        <li className="ProductTile" data-testid="tile-b" />
      </ul>
      <LiquidLens products={list} wrapperRef={ref} />
    </div>
  );
};

const renderLens = (list = products) => {
  const result = renderWithIntl(<Harness list={list} />);
  return { ...result, wrapper: screen.getByTestId('wrapper') };
};

const setFinePointer = (fine: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('hover: hover') && query.includes('pointer: fine') ? fine : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

beforeEach(() => {
  motion.reduced = false;
  setFinePointer(true);
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('LiquidLens', () => {
  it('re-anchors where the pointer enters each new tile, and stays put inside a tile', () => {
    const { container } = renderLens();
    act(() => {
      fireEvent.pointerOver(screen.getByTestId('tile-a'), { clientX: 40, clientY: 40 });
    });
    const seedA = container.querySelector('.LiquidLens')!.getAttribute('data-seed');
    act(() => {
      fireEvent.pointerOver(screen.getByTestId('tile-a'), { clientX: 90, clientY: 90 });
    });
    expect(container.querySelector('.LiquidLens')!.getAttribute('data-seed')).toBe(seedA);
    act(() => {
      fireEvent.pointerOver(screen.getByTestId('tile-b'), { clientX: 200, clientY: 40 });
    });
    expect(container.querySelector('.LiquidLens')!.getAttribute('data-seed')).not.toBe(seedA);
  });

  it('renders nothing for reduced motion', () => {
    motion.reduced = true;
    const { container } = renderLens();
    expect(container.querySelector('.LiquidLens')).toBeNull();
  });

  it('renders nothing for touch and other coarse pointers', () => {
    setFinePointer(false);
    const { container } = renderLens();
    expect(container.querySelector('.LiquidLens')).toBeNull();
  });

  it('mounts the x-ray layer only after the first pointer entry', () => {
    const { container } = renderLens();
    expect(container.querySelector('.LiquidLens__xray')).toBeNull();
    act(() => {
      fireEvent.pointerOver(screen.getByTestId('tile-a'), { clientX: 40, clientY: 40 });
    });
    expect(container.querySelector('.LiquidLens__xray')).not.toBeNull();
  });

  it('keeps the x-ray layer out of the accessibility tree and off the pointer', () => {
    const { container } = renderLens();
    act(() => {
      fireEvent.pointerOver(screen.getByTestId('tile-a'), { clientX: 40, clientY: 40 });
    });
    const layer = container.querySelector<HTMLElement>('.LiquidLens__xray')!;
    expect(layer).toHaveAttribute('aria-hidden', 'true');
    expect(layer.className).toMatch(/pointer-events-none/);
  });

  it('makes every x-ray copy inert: no clicks, no focus, no links in the tab order', () => {
    const { container } = renderLens();
    act(() => {
      fireEvent.pointerOver(screen.getByTestId('tile-a'), { clientX: 40, clientY: 40 });
    });
    const cells = container.querySelectorAll('.XrayCell');
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) expect(cell).toHaveAttribute('inert');
  });

  it('adds the film grain layer inside the lens', () => {
    const { container } = renderLens();
    act(() => {
      fireEvent.pointerOver(screen.getByTestId('tile-a'), { clientX: 40, clientY: 40 });
    });
    expect(container.querySelector('.LiquidLens .LiquidLens__grain')).not.toBeNull();
  });

  it('shows each product back with its name and price in the x-ray cells', () => {
    const { container } = renderLens();
    act(() => {
      fireEvent.pointerOver(screen.getByTestId('tile-a'), { clientX: 40, clientY: 40 });
    });
    const xray = container.querySelector('.LiquidLens__xray')!;
    expect(xray.querySelectorAll('.XrayCell')).toHaveLength(products.length);
    expect(xray.textContent).toContain(products[0].name);
    expect(xray.textContent).toContain(products[0].priceLabel);
    // The back photo's card is the same markup as the hover card: name, price, badge and action.
    expect(xray.querySelector('.XrayCell__card .ProductHoverCard__name')).toHaveTextContent(
      products[0].name,
    );
  });

  it('follows a product list change (pagination)', () => {
    const { container, rerender } = renderLens(products.slice(0, 4));
    act(() => {
      fireEvent.pointerOver(screen.getByTestId('tile-a'), { clientX: 40, clientY: 40 });
    });
    rerender(<Harness list={products.slice(4, 8)} />);
    const xray = container.querySelector('.LiquidLens__xray')!;
    expect(xray.querySelectorAll('.XrayCell')).toHaveLength(4);
    expect(xray.textContent).toContain(products[4].name);
    expect(xray.textContent).not.toContain(products[0].name);
  });

  it('stops the animation frame loop on unmount', () => {
    const cancel = vi.mocked(window.cancelAnimationFrame);
    const { unmount } = renderLens();
    act(() => {
      fireEvent.pointerOver(screen.getByTestId('tile-a'), { clientX: 40, clientY: 40 });
    });
    unmount();
    expect(cancel).toHaveBeenCalled();
  });
});
