import { copy } from '@/content/copy/vi';

export interface NavItem {
  href: string;
  label: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

interface SiteConfig {
  name: string;
  /** Owner: set the shop email to show it in the footer. Hidden while undefined. */
  contactEmail?: string;
  /** Owner: add Instagram / TikTok / Facebook links. Hidden while empty. */
  socials: SocialLink[];
  nav: NavItem[];
  policies: NavItem[];
}

export const siteConfig: SiteConfig = {
  name: copy.site.name,
  contactEmail: undefined,
  socials: [],
  nav: [
    { href: '/about', label: copy.nav.about },
    { href: '/contact', label: copy.nav.contact },
  ],
  policies: [
    { href: '/policy/privacy', label: copy.footer.privacy },
    { href: '/policy/returns', label: copy.footer.returns },
  ],
};
