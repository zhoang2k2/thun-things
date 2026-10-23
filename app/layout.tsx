import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Thun Things',
  description: 'Thun Things — T-shirt brand',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
