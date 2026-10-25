import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CursorLiquid } from '@/components/motion/CursorLiquid';
import { LENS } from '@/lib/motion/liquid';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('@/lib/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => motion.reduced,
}));

const setFinePointer = (fine: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('pointer: fine') ? fine : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

let pending: FrameRequestCallback[] = [];
let clock = 0;
/** Runs animation frames for `ms` of simulated time, 16ms apart. */
const run = (ms: number) => {
  for (let elapsed = 0; elapsed < ms; elapsed += 16) {
    clock += 16;
    const next = pending.shift();
    act(() => next?.(clock));
  }
};

/** Width of the current outline, from its vertices. */
const outlineWidth = (container: HTMLElement) => {
  const d =
    container.ownerDocument.querySelector('.CursorLiquid__clip path')?.getAttribute('d') ?? '';
  const xs = [...d.matchAll(/(-?\d+\.?\d*) -?\d+\.?\d*/g)].map(([, x]) => Number(x));
  return xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
};

beforeEach(() => {
  motion.reduced = false;
  setFinePointer(true);
  pending = [];
  clock = 0;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    pending.push(callback);
    return pending.length;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('CursorLiquid', () => {
  it('renders nothing under reduced motion or on touch', () => {
    motion.reduced = true;
    const { container, unmount } = render(<CursorLiquid />);
    expect(container.querySelector('.CursorLiquid')).toBeNull();
    unmount();
    motion.reduced = false;
    setFinePointer(false);
    expect(render(<CursorLiquid />).container.querySelector('.CursorLiquid')).toBeNull();
  });

  it('follows the pointer in the outer state (near-circle) outside the product grid', () => {
    const { container } = render(<CursorLiquid />);
    fireEvent.pointerMove(document.body, { clientX: 300, clientY: 200 });
    run(600);
    const width = outlineWidth(container);
    expect(width).toBeGreaterThan(LENS.outerDiameter * 0.85);
    expect(width).toBeLessThan(LENS.outerDiameter * 1.15);
  });

  it('spreads to the inner state over the product grid', () => {
    const grid = document.createElement('div');
    grid.className = 'ProductGrid';
    document.body.appendChild(grid);
    const { container } = render(<CursorLiquid />);
    fireEvent.pointerMove(grid, { clientX: 300, clientY: 200 });
    run(900);
    expect(outlineWidth(container)).toBeGreaterThan(LENS.innerDiameter * 0.8);
  });

  it('copies the hover card button into the liquid layer, purple by default', () => {
    const card = document.createElement('div');
    card.className = 'ProductHoverCard';
    card.innerHTML = '<a class="ProductAction">Liên hệ đặt hàng</a>';
    document.body.appendChild(card);
    const { container } = render(<CursorLiquid />);
    fireEvent.pointerMove(document.body, { clientX: 300, clientY: 200 });
    run(100);
    const copy = container.ownerDocument.querySelector<HTMLElement>('.CursorLiquid__button')!;
    expect(copy).toHaveTextContent('Liên hệ đặt hàng');
    expect(copy.dataset.hover).toBe('false');
  });

  it('stays out of the accessibility tree and off the pointer', () => {
    const { container } = render(<CursorLiquid />);
    for (const layer of container.querySelectorAll('.CursorLiquid')) {
      expect(layer).toHaveAttribute('aria-hidden', 'true');
      expect(layer.className).toMatch(/pointer-events-none/);
    }
  });
});
