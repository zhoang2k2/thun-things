import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Thun Things',
  description: 'Thun Things technical foundation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
