// Animation features for `LazyMotion`, split into their own chunk so pages paint before Motion's
// animation engine downloads. `domAnimation` covers animate/exit/variants (no layout or drag).
import { domAnimation } from 'motion/react';

export default domAnimation;
