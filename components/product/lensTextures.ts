// Textures for the liquid lens (P11 rev 3). Inline SVG data, so no requests and no stylesheet weight.

export const BRAND_ORANGE = '#E8662E';
export const LENS_PURPLE = '#6B3FA0';

/** A CSS `url()` for an SVG document. */
export const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

// Orange (t = 0) and purple (t = 1) mixed in soft streaks: fractal noise, stretched by the transfer,
// then mapped to the two colours. Stitched, so the 256px tile repeats without a seam.
const MIX = `${[
  '-0.49 0 0 0 0.91', // red:   orange → purple
  '-0.15 0 0 0 0.40', // green
  '0.45 0 0 0 0.18', // blue
  '0 0 0 0 1', // opaque
].join(' ')}`;

export const LIQUID_TINT = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
<filter id="m" x="0" y="0" width="100%" height="100%">
<feTurbulence type="fractalNoise" baseFrequency="0.011 0.02" numOctaves="3" seed="7" stitchTiles="stitch"/>
<feComponentTransfer><feFuncR type="linear" slope="2.4" intercept="-0.7"/></feComponentTransfer>
<feColorMatrix type="matrix" values="${MIX}"/>
</filter>
<rect width="100%" height="100%" filter="url(#m)"/>
</svg>`);

// Film grain: high-frequency noise pushed to strong contrast, blended soft-light by the stylesheet.
export const FILM_GRAIN = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
<filter id="n">
<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
<feColorMatrix type="saturate" values="0"/>
<feComponentTransfer>
<feFuncR type="linear" slope="3" intercept="-1"/>
<feFuncG type="linear" slope="3" intercept="-1"/>
<feFuncB type="linear" slope="3" intercept="-1"/>
</feComponentTransfer>
</filter>
<rect width="100%" height="100%" filter="url(#n)"/>
</svg>`);
