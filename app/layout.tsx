import './globals.css';

import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { siteConfig } from '@/config/site';
import { copy } from '@/content/copy/vi';
import { buildMetadata } from '@/lib/seo/metadata';

const grotesk = Bricolage_Grotesque({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  ...buildMetadata({ description: copy.site.description, path: '/' }),
  title: { default: copy.site.name, template: `%s · ${copy.site.name}` },
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
