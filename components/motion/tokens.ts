// Shared motion language (seconds, for `motion`). See motion-guidelines skill.
export const motionTokens = {
  duration: { instant: 0.1, fast: 0.2, normal: 0.35, slow: 0.6, hero: 1 },
  ease: {
    out: [0.16, 1, 0.3, 1],
    inOut: [0.65, 0, 0.35, 1],
  },
  stagger: 0.05,
} as const;
