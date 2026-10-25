// Liquid lens maths (P11 spec section 1). Pure: no DOM, no React, so it is unit-tested directly.

export const LENS = {
  /** Lens diameter in px; one constant to try other sizes. */
  diameter: 200,
  /** Longest stretch along the direction of travel (area is kept, so the rest squeezes). */
  maxStretch: 1.35,
  /** Radius wobble amplitude, as a fraction of the radius (P11-4: the edge never sits still). */
  wobble: 0.08,
  /** Vertices of the lens outline. */
  points: 48,
  /** Time to settle within 1px of a step target (P11-4: under ~60 ms of perceived lag). */
  settleMs: 60,
  /** Stretch per px/ms of pointer speed, before the cap. */
  stretchPerSpeed: 0.1,
} as const;

export interface FollowerState {
  x: number;
  y: number;
  /** px per ms. */
  vx: number;
  vy: number;
}

export interface LensInput {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tMs: number;
  radius: number;
}

// Time constant that brings a 200px step within 1px in LENS.settleMs: ln(200) ≈ 5.3.
const FOLLOW_TAU_MS = LENS.settleMs / Math.log(LENS.diameter);

/** Moves the lens centre towards the pointer; exponential smoothing, no overshoot. */
export const stepFollower = (
  state: FollowerState,
  target: { x: number; y: number },
  dtMs: number,
): FollowerState => {
  if (dtMs <= 0) return state;
  const blend = 1 - Math.exp(-dtMs / FOLLOW_TAU_MS);
  const x = state.x + (target.x - state.x) * blend;
  const y = state.y + (target.y - state.y) * blend;
  return { x, y, vx: (x - state.x) / dtMs, vy: (y - state.y) / dtMs };
};

// Two low-frequency terms: the edge breathes slowly even at rest.
const wobbleAt = (angle: number, tMs: number) =>
  1 +
  LENS.wobble * (0.6 * Math.sin(2 * angle + tMs / 1_400) + 0.4 * Math.sin(3 * angle - tMs / 2_300));

/** The lens outline as an SVG path, centred on the pointer and stretched along its velocity. */
export const lensPath = ({ x, y, vx, vy, tMs, radius }: LensInput): string => {
  const speed = Math.hypot(vx, vy);
  const stretch = 1 + Math.min(LENS.maxStretch - 1, speed * LENS.stretchPerSpeed);
  // Unit vectors along and across the travel; at rest the stretch is 1 and the lens is a circle.
  const along = speed > 0 ? { x: vx / speed, y: vy / speed } : { x: 1, y: 0 };
  const across = { x: -along.y, y: along.x };

  const vertices: string[] = [];
  for (let i = 0; i < LENS.points; i += 1) {
    const angle = (i / LENS.points) * Math.PI * 2;
    const r = radius * wobbleAt(angle, tMs);
    const u = Math.cos(angle) * r;
    const v = Math.sin(angle) * r;
    // Area-preserving stretch: longer along the travel, proportionally thinner across it.
    const a = u * stretch;
    const c = v / stretch;
    const px = x + a * along.x + c * across.x;
    const py = y + a * along.y + c * across.y;
    vertices.push(`${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return `M ${vertices.join(' L ')} Z`;
};
