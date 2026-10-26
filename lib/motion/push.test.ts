import { describe, expect, it } from 'vitest';

import { PUSH, pushFor } from '@/lib/motion/push';

describe('pushFor', () => {
  it('leaves tiles outside the radius untouched', () => {
    expect(pushFor({ x: 0, y: 0 }, { x: PUSH.radius + 1, y: 0 })).toEqual({ x: 0, y: 0, scale: 1 });
  });

  it('pushes a nearby tile away from the liquid, at most maxOffset', () => {
    const push = pushFor({ x: 0, y: 0 }, { x: 40, y: 0 });
    expect(push.x).toBeGreaterThan(0);
    expect(push.x).toBeLessThanOrEqual(PUSH.maxOffset);
    expect(push.y).toBeCloseTo(0, 5);
  });

  it('pushes harder and shrinks more when closer', () => {
    const near = pushFor({ x: 0, y: 0 }, { x: 30, y: 0 });
    const far = pushFor({ x: 0, y: 0 }, { x: 200, y: 0 });
    expect(near.x).toBeGreaterThan(far.x);
    expect(near.scale).toBeLessThan(far.scale);
    expect(near.scale).toBeGreaterThanOrEqual(PUSH.minScale);
  });

  it('points away from the liquid in every direction', () => {
    const push = pushFor({ x: 100, y: 100 }, { x: 60, y: 60 });
    expect(push.x).toBeLessThan(0);
    expect(push.y).toBeLessThan(0);
  });

  it('does nothing when the liquid sits exactly on the tile centre', () => {
    expect(pushFor({ x: 10, y: 10 }, { x: 10, y: 10 })).toEqual({ x: 0, y: 0, scale: 1 });
  });
});
