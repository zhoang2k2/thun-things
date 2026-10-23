import Link from 'next/link';

import type { NavItem, SocialLink } from '@/config/site';
import { copy } from '@/content/copy/vi';

interface SiteFooterProps {
  policies: NavItem[];
  contactEmail?: string;
  socials: SocialLink[];
}

const LINK_CLASSES =
  'focus-visible:outline-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2';
const HEADING_CLASSES = 'SiteFooter__heading text-ink-muted mb-2 text-xs tracking-wide uppercase';

export const SiteFooter = ({ policies, contactEmail, socials }: SiteFooterProps) => {
  const hasSocials = socials.length > 0;

  return (
    <footer className="SiteFooter border-line mt-24 overflow-hidden border-t">
      <div className="SiteFooter__columns mx-auto grid max-w-screen-2xl gap-8 px-4 py-12 text-sm md:grid-cols-3 md:px-8">
        <section className="SiteFooter__group">
          <h2 className={HEADING_CLASSES}>{copy.footer.policyLabel}</h2>
          <ul className="SiteFooter__list flex flex-col gap-2">
            {policies.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={`SiteFooter__link ${LINK_CLASSES}`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        {contactEmail && (
          <section className="SiteFooter__group">
            <h2 className={HEADING_CLASSES}>{copy.footer.emailLabel}</h2>
            <a href={`mailto:${contactEmail}`} className={`SiteFooter__link ${LINK_CLASSES}`}>
              {contactEmail}
            </a>
          </section>
        )}
        {hasSocials && (
          <section className="SiteFooter__group">
            <h2 className={HEADING_CLASSES}>{copy.footer.socialLabel}</h2>
            <ul className="SiteFooter__list flex flex-col gap-2">
              {socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`SiteFooter__link ${LINK_CLASSES}`}
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <p
        aria-hidden="true"
        className="SiteFooter__wordmark px-2 text-[17vw] leading-[0.8] font-extrabold tracking-tighter whitespace-nowrap uppercase"
      >
        {copy.site.name}
      </p>
    </footer>
  );
};
