'use client';

import { motion, useReducedMotion } from 'motion/react';

import { motionTokens } from '@/components/motion/tokens';
import type { ActiveCard } from '@/components/product/ProductGrid';

// Global stylesheet: the Turbopack Tailwind rule treats every *.css as global, so no CSS Modules.
import './glass.css';

// Blob size relative to the cell width: ~1.8× the 1.3× card.
const WIDTH_RATIO = 2.34;
const HEIGHT_RATIO = 2.6;
// The card's visual centre sits below the cell centre (frame + info area).
const CENTRE_Y_RATIO = 0.8;

interface GlassLayerProps {
  active: ActiveCard;
}

// One shared instance per grid, behind the open card and above the other cells (V-25).
export const GlassLayer = ({ active }: GlassLayerProps) => {
  const reducedMotion = useReducedMotion();
  const { rect, origin } = active;
  const width = rect.width * WIDTH_RATIO;
  const height = rect.width * HEIGHT_RATIO;
  const left = rect.left + rect.width / 2 - width / 2;
  const top = rect.top + rect.width * CENTRE_Y_RATIO - height / 2;
  // Spread from the pointer: origin expressed in the blob's own box.
  const originX = rect.left + origin.x - left;
  const originY = rect.top + origin.y - top;
  const hidden = reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.2 };

  return (
    <motion.div
      aria-hidden="true"
      className="GlassLayer pointer-events-none absolute z-20"
      style={{ left, top, width, height, transformOrigin: `${originX}px ${originY}px` }}
      initial={hidden}
      animate={{ opacity: 1, scale: 1 }}
      exit={hidden}
      transition={{ duration: motionTokens.duration.slow, ease: motionTokens.ease.out }}
    >
      <div className="GlassLayer__blob" />
    </motion.div>
  );
};
