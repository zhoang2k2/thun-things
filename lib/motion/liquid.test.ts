import { describe, expect, it } from 'vitest';

import { LENS, lensPath, stepFollower } from '@/lib/motion/liquid';

const at = (overrides: Partial<Parameters<typeof lensPath>[0]> = {}) =>
  lensPath({ x: 0, y: 0, vx: 0, vy: 0, tMs: 0, radius: LENS.diameter / 2, ...overrides });

/** Vertices of the path string: "M x y L x y ... Z". */
const vertices = (path: string) =>
  [...path.matchAll(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g)].map(([, x, y]) => ({
    x: Number(x),
    y: Number(y),
  }));

/** Shoelace area of the polygon. */
const area = (points: { x: number; y: number }[]) => {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
};

describe('lensPath', () => {
  it('is a closed polygon with the configured vertex count', () => {
    const path = at();
    expect(path.startsWith('M ')).toBe(true);
    expect(path.endsWith(' Z')).toBe(true);
    expect(vertices(path)).toHaveLength(LENS.points);
  });

  it('keeps every vertex within ±8% of the radius at rest', () => {
    const radius = LENS.diameter / 2;
    for (const tMs of [0, 700, 1500, 3000]) {
      for (const vertex of vertices(at({ tMs }))) {
        const distance = Math.hypot(vertex.x, vertex.y);
        expect(distance).toBeGreaterThanOrEqual(radius * (1 - LENS.wobble) - 0.5);
        expect(distance).toBeLessThanOrEqual(radius * (1 + LENS.wobble) + 0.5);
      }
    }
  });

  it('changes over time at rest (the edge keeps moving)', () => {
    expect(at({ tMs: 0 })).not.toBe(at({ tMs: 900 }));
  });

  it('stretches along the direction of travel by at most maxStretch', () => {
    const radius = LENS.diameter / 2;
    const fast = vertices(at({ vx: 3, vy: 0 }));
    const along = Math.max(...fast.map((vertex) => vertex.x));
    expect(along).toBeLessThanOrEqual(radius * (1 + LENS.wobble) * LENS.maxStretch + 0.5);
    expect(along).toBeGreaterThan(radius * 1.2);
  });

  it('keeps the area roughly constant while stretched', () => {
    const rest = area(vertices(at({ tMs: 0 })));
    const stretched = area(vertices(at({ tMs: 0, vx: 3, vy: 0 })));
    expect(Math.abs(stretched - rest) / rest).toBeLessThanOrEqual(0.1);
  });

  it('stretches along any direction, not just x', () => {
    const fast = vertices(at({ vx: 0, vy: 3 }));
    const along = Math.max(...fast.map((vertex) => vertex.y));
    expect(along).toBeGreaterThan((LENS.diameter / 2) * 1.2);
  });
});

describe('stepFollower', () => {
  const start = { x: 0, y: 0, vx: 0, vy: 0 };

  it('reaches within 1px of a step target in at most settleMs', () => {
    let state = start;
    for (let elapsed = 0; elapsed < LENS.settleMs; elapsed += 4) {
      state = stepFollower(state, { x: 200, y: 0 }, 4);
    }
    expect(Math.abs(200 - state.x)).toBeLessThanOrEqual(1);
  });

  it('reports velocity in px per ms towards the target', () => {
    const next = stepFollower(start, { x: 100, y: 0 }, 16);
    expect(next.vx).toBeGreaterThan(0);
    expect(next.vy).toBe(0);
  });

  it('is a no-op for zero elapsed time', () => {
    expect(stepFollower(start, { x: 50, y: 50 }, 0)).toEqual(start);
  });

  it('never overshoots the target', () => {
    let state = start;
    for (let i = 0; i < 100; i += 1) {
      state = stepFollower(state, { x: 100, y: 0 }, 8);
      expect(state.x).toBeLessThanOrEqual(100);
    }
  });
});
