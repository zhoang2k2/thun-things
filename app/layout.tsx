import './globals.css';

import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';

const grotesk = Bricolage_Grotesque({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Thun Things',
  description: 'Thun Things — T-shirt brand',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="vi" className={grotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
