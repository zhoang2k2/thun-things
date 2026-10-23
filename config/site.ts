export interface NavItem {
  href: string;
  label: string;
}

/** A link whose label is a message key, translated where it is rendered. */
export interface NavLink {
  href: string;
  labelKey: 'nav.about' | 'nav.contact' | 'footer.privacy' | 'footer.returns';
}

export interface SocialLink {
  label: string;
  href: string;
}

interface SiteConfig {
  /** Owner: set the shop email to show it in the footer. Hidden while undefined. */
  contactEmail?: string;
  /** Owner: add Instagram / TikTok / Facebook links. Hidden while empty. */
  socials: SocialLink[];
  /** Owner: Zalo / Messenger / Instagram DM link for ordering (V-20). Contact page until set. */
  chatChannel?: { label: string; href: string };
  nav: NavLink[];
  policies: NavLink[];
}

export const siteConfig: SiteConfig = {
  contactEmail: undefined,
  socials: [],
  chatChannel: undefined,
  nav: [
    { href: '/about', labelKey: 'nav.about' },
    { href: '/contact', labelKey: 'nav.contact' },
  ],
  policies: [
    { href: '/policy/privacy', labelKey: 'footer.privacy' },
    { href: '/policy/returns', labelKey: 'footer.returns' },
  ],
};
