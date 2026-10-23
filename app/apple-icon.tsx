import { ImageResponse } from 'next/og';

import { loadOgFont } from '@/lib/seo/ogImage';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: '#ffffff',
        color: '#111111',
        fontFamily: 'Bricolage Grotesque',
        fontSize: 120,
        lineHeight: 1,
      }}
    >
      <div style={{ display: 'flex' }}>T</div>
      <div style={{ display: 'flex', width: 100, height: 10, background: '#ff5a1f' }} />
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Bricolage Grotesque', data: await loadOgFont(), style: 'normal', weight: 700 },
      ],
    },
  );
}
