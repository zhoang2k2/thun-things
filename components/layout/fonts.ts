import { Bricolage_Grotesque } from 'next/font/google';

/** The display face, shared by the locale root layout and the global 404 page. */
export const grotesk = Bricolage_Grotesque({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-grotesk',
  display: 'swap',
});
