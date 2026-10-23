import './globals.css';

import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { siteConfig } from '@/config/site';

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
      <body>
        <SkipLink />
        <SiteHeader nav={siteConfig.nav} />
        <main id="main" tabIndex={-1} className="Main focus:outline-none">
          {children}
        </main>
        <SiteFooter
          policies={siteConfig.policies}
          contactEmail={siteConfig.contactEmail}
          socials={siteConfig.socials}
        />
      </body>
    </html>
  );
}
