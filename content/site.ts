/**
 * Site-wide content and configuration.
 *
 * Copy lives here, never in components. Facts below come from the brief, the
 * client's own printed material (banner, van livery) and postcodes.io; nothing
 * is invented. Where a fact isn't known yet the field is empty and the UI
 * renders nothing — a visible gap is a prompt to go and get the real value.
 */

export type NavItem = { href: string; label: string };

export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  locale: string;
  contact: { email: string; phone: string; address: string; addressLines: string[] };
  company: {
    registeredName: string;
    number: string;
    placeOfRegistration: string;
    registeredOffice: string;
    vatNumber: string;
  };
  /** Shown in the utility strip until online ordering is switched on. */
  preLaunchNotice: string;
  nav: NavItem[];
  footerNav: NavItem[];
};

export const site: SiteConfig = {
  name: 'Absolute Catering Supplies',
  // The client's own line, from their shop banner.
  tagline: 'We have got it all',
  description:
    'Fresh and frozen food, catering packaging and household essentials from our cash and carry in Omagh. Delivered within 30 miles, or ready to collect from the store.',
  // `||`, not `??`: Vercel creates detected env vars as empty strings.
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000',
  locale: 'en-GB',

  contact: {
    email: '',
    // From the shop banner and the brief (Noel Carlin's number).
    phone: '028 8224 8104',
    address: '23D Gortrush Industrial Estate, Omagh, BT78 5EJ',
    addressLines: ['23D Gortrush Industrial Estate', 'Omagh', 'BT78 5EJ'],
  },

  /** Legal identification — awaiting the client (register #16). Never guess. */
  company: {
    registeredName: '',
    number: '',
    placeOfRegistration: 'Northern Ireland',
    registeredOffice: '',
    vatNumber: '',
  },

  preLaunchNotice: 'Online ordering opens soon. Browse the range now.',

  nav: [
    { href: '/shop', label: 'All aisles' },
    { href: '/absolute-range', label: 'Absolute Range' },
    { href: '/delivery', label: 'Delivery & collection' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],

  footerNav: [
    { href: '/delivery', label: 'Delivery & collection' },
    { href: '/payments', label: 'How payment works' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/accessibility', label: 'Accessibility' },
  ],
};
