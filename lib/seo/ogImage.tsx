import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

import { copy } from '@/content/copy/vi';
import { formatPriceVND } from '@/lib/catalog/format';
import type { Product } from '@/lib/catalog/schema';
import { presentStatus } from '@/lib/catalog/status';

export const OG_SIZE = { width: 1200, height: 630 };

const INK = '#111111';
const ACCENT = '#ff5a1f';
const FONT_NAME = 'Bricolage Grotesque';

// Read once at module load: a read inside the render function would make every image dynamic
// under Cache Components, and static images are the point.
const fontFile = await readFile(join(process.cwd(), 'assets/fonts/BricolageGrotesque-Bold.ttf'));

/** The committed Bricolage Grotesque Bold TTF (SIL OFL) for Satori. */
export const loadOgFont = async (): Promise<ArrayBuffer> =>
  fontFile.buffer.slice(
    fontFile.byteOffset,
    fontFile.byteOffset + fontFile.byteLength,
  ) as ArrayBuffer;

const respond = async (content: React.ReactElement) =>
  new ImageResponse(content, {
    ...OG_SIZE,
    fonts: [{ name: FONT_NAME, data: await loadOgFont(), style: 'normal', weight: 700 }],
  });

const frameStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  padding: 64,
  background: '#ffffff',
  color: INK,
  fontFamily: FONT_NAME,
} as const;

const Wordmark = ({ size }: { size: number }) => (
  <div
    style={{
      display: 'flex',
      fontSize: size,
      lineHeight: 0.85,
      letterSpacing: -size * 0.02,
      textTransform: 'uppercase',
    }}
  >
    {copy.site.name}
  </div>
);

export const renderWordmarkImage = async () =>
  respond(
    <div style={frameStyle}>
      <div style={{ display: 'flex', width: 120, height: 16, background: ACCENT }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <Wordmark size={200} />
        <div style={{ display: 'flex', fontSize: 36, color: INK }}>{copy.site.description}</div>
      </div>
    </div>,
  );

export const renderProductImage = async (product: Product) => {
  const status = presentStatus(product.status);
  return respond(
    <div style={{ ...frameStyle, flexDirection: 'row', gap: 56 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
        }}
      >
        <Wordmark size={40} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', fontSize: 72, lineHeight: 1.05 }}>{product.name.vi}</div>
          <div style={{ display: 'flex', fontSize: 48 }}>{formatPriceVND(product.priceVND)}</div>
          <div style={{ display: 'flex' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                padding: '8px 20px',
                border: `4px solid ${INK}`,
                background:
                  product.status === 'limited' || product.status === 'preorder'
                    ? ACCENT
                    : '#ffffff',
              }}
            >
              {status.label}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', width: 420, border: `4px solid ${INK}` }} />
    </div>,
  );
};
