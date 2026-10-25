// Neighbour push (P11-R4-4): a design near the liquid moves a few pixels away from it and shrinks a
// little, stronger when closer. Pure, so it is unit-tested without the DOM.

export const PUSH = {
  /** Reach of the push from the liquid centre, in px. */
  radius: 260,
  /** Largest move, in px. */
  maxOffset: 6,
  /** Smallest scale, for a tile right next to the liquid. */
  minScale: 0.97,
} as const;

export interface Push {
  x: number;
  y: number;
  scale: number;
}

const REST: Push = { x: 0, y: 0, scale: 1 };

/** How far and which way to move a tile (by its centre) for a liquid at `liquid`. */
export const pushFor = (liquid: { x: number; y: number }, tile: { x: number; y: number }): Push => {
  const dx = tile.x - liquid.x;
  const dy = tile.y - liquid.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0 || distance >= PUSH.radius) return REST;
  // Eased falloff: strong near the liquid, fading to nothing at the edge of its reach.
  const strength = (1 - distance / PUSH.radius) ** 2;
  return {
    x: (dx / distance) * PUSH.maxOffset * strength,
    y: (dy / distance) * PUSH.maxOffset * strength,
    scale: 1 - (1 - PUSH.minScale) * strength,
  };
};
