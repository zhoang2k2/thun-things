import { describe, expect, it } from 'vitest';

import { LENS, lensOutline } from '@/lib/motion/liquid';

const R = LENS.diameter / 2;

const outline = (overrides: Partial<Parameters<typeof lensOutline>[0]> = {}) =>
  lensOutline({ cx: 0, cy: 0, radius: R, tMs: 0, seed: 7, ...overrides });

/** Vertices of an "M x y L x y ... Z" path. */
const vertices = (path: string) =>
  [...path.matchAll(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g)].map(([, x, y]) => ({
    x: Number(x),
    y: Number(y),
  }));

const radii = (path: string) => vertices(path).map((vertex) => Math.hypot(vertex.x, vertex.y));

describe('lensOutline', () => {
  it('is a closed polygon with the configured vertex count', () => {
    const path = outline();
    expect(path.startsWith('M ')).toBe(true);
    expect(path.endsWith(' Z')).toBe(true);
    expect(vertices(path)).toHaveLength(LENS.points);
  });

  it('is deterministic for the same seed and time', () => {
    expect(outline({ tMs: 1200 })).toBe(outline({ tMs: 1200 }));
  });

  it('gives a different shape for another seed', () => {
    expect(outline({ seed: 1 })).not.toBe(outline({ seed: 2 }));
  });

  it('keeps the lens centred on the given point', () => {
    const points = vertices(outline({ cx: 300, cy: 150 }));
    const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
    expect(Math.abs(meanX - 300)).toBeLessThan(R * 0.15);
    expect(Math.abs(meanY - 150)).toBeLessThan(R * 0.15);
  });

  it('is deep and irregular, not a circle: dents and bulges across the outline', () => {
    for (const seed of [1, 7, 42]) {
      const values = radii(outline({ seed, tMs: 2500 }));
      expect(Math.max(...values) / Math.min(...values)).toBeGreaterThan(1.3);
    }
  });

  it('keeps every vertex within the configured depth band', () => {
    for (const tMs of [0, 900, 4000]) {
      for (const value of radii(outline({ tMs, seed: 42 }))) {
        expect(value).toBeGreaterThanOrEqual(R * LENS.minScale - 0.5);
        expect(value).toBeLessThanOrEqual(R * LENS.maxScale + 0.5);
      }
    }
  });

  it('keeps morphing over time (the edge never sits still)', () => {
    expect(outline({ tMs: 0 })).not.toBe(outline({ tMs: 1500 }));
  });

  it('shrinks to nothing at zero radius', () => {
    for (const value of radii(outline({ radius: 0 }))) expect(value).toBeCloseTo(0, 5);
  });
});
