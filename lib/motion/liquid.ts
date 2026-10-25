// Liquid lens outline (P11, revision 2). Pure: no DOM, no React, unit-tested directly. The lens does
// not follow the pointer; it stays where the pointer entered and morphs on its own clock, so its
// shape only depends on the seed of that entry and on time.

export const LENS = {
  /** Diameter over the product grid, in px (P11-R4-2). */
  diameter: 240,
  /** Diameter everywhere else: a near-circle that follows the pointer. */
  restDiameter: 120,
  /** Depth everywhere else: a faint wobble. */
  restDepth: 0.03,
  /** Vertices of the outline. */
  points: 72,
  /** Harmonics summed into the radius: more harmonics, more irregular dents and bulges. */
  harmonics: 6,
  /** Deepest bulge/dent as a fraction of the radius (owner: deeper, not a circle). */
  depth: 0.22,
  /** Hard limits of the outline as a fraction of the radius, so it never tears or disappears. */
  minScale: 0.55,
  maxScale: 1.6,
} as const;

export interface LensInput {
  cx: number;
  cy: number;
  /** Full radius, already eased by the caller while the lens grows or shrinks. */
  radius: number;
  tMs: number;
  /** Chosen per entry, so every entry gets its own shape. */
  seed: number;
  /** Deepest bulge/dent as a fraction of the radius; defaults to `LENS.depth`. */
  depth?: number;
}

/** Small deterministic PRNG (mulberry32): the same seed always gives the same lens. */
const random = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

interface Harmonic {
  order: number;
  amplitude: number;
  phase: number;
  /** radians per ms; the sign differs, so dents and bulges travel both ways. */
  speed: number;
}

const harmonicsFor = (seed: number): Harmonic[] => {
  const next = random(seed);
  return Array.from({ length: LENS.harmonics }, (_, index) => ({
    // Orders 2..8 with jitter: no fixed rhythm, so the outline never reads as a regular wave.
    order: 2 + index + Math.floor(next() * 2),
    amplitude: (LENS.depth * (0.4 + next() * 0.6)) / (1 + index * 0.35),
    phase: next() * Math.PI * 2,
    speed: ((0.6 + next() * 1.4) * (next() < 0.5 ? -1 : 1)) / 1_800,
  }));
};

/** The lens outline as an SVG path, centred on (cx, cy). */
export const lensOutline = ({
  cx,
  cy,
  radius,
  tMs,
  seed,
  depth = LENS.depth,
}: LensInput): string => {
  const harmonics = harmonicsFor(seed);
  const strength = depth / LENS.depth;
  const vertices: string[] = [];
  for (let i = 0; i < LENS.points; i += 1) {
    const angle = (i / LENS.points) * Math.PI * 2;
    let scale = 1;
    for (const { order, amplitude, phase, speed } of harmonics) {
      scale += strength * amplitude * Math.sin(order * angle + phase + speed * tMs);
    }
    const clamped = Math.min(LENS.maxScale, Math.max(LENS.minScale, scale));
    const r = radius * clamped;
    vertices.push(
      `${(cx + Math.cos(angle) * r).toFixed(1)} ${(cy + Math.sin(angle) * r).toFixed(1)}`,
    );
  }
  return `M ${vertices.join(' L ')} Z`;
};
