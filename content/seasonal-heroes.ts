/**
 * Homepage hero by month. Each month can override the photo, the copy and a
 * short row of "favourites" links; anything left out falls back to the
 * all-year hero (content/home.ts + content/images.ts heroImage).
 *
 * Months are 1–12 in UK time. The homepage revalidates hourly, so a new
 * month's hero appears within the hour after midnight on the 1st.
 *
 * Photos are stock (mood slot only, never a product tile) and must be logged
 * in docs/STOCK-LICENCES.md. Copy follows the same rule as home.ts: only what
 * the shop actually sells, nothing about dates, slots or prices the client
 * hasn't confirmed.
 *
 * Added 23 Nov 2026 (Alex): December/Christmas first; other months to follow.
 */
import type { Banner } from '@/content/images';

export type SeasonalHero = {
  /** For the register and this file only; not shown. */
  label: string;
  /** Hooks the month's colour treatment in globals.css ([data-season=…]). */
  key?: string;
  /** Short text on a shop-style price sticker over the photo. */
  sticker?: string;
  image?: Banner;
  eyebrow?: string;
  heading?: string;
  body?: string;
  /** Up to five product links shown as short chips under the copy. Slugs must exist. */
  favourites?: { heading: string; items: { slug: string; label: string }[] };
};

export const seasonalHeroes: Partial<Record<number, SeasonalHero>> = {
  12: {
    label: 'December / Christmas',
    key: 'christmas',
    sticker: 'Christmas range in store',
    // Adobe Stock 312380078 'Close up of a Christmas dinner table' (Carey),
    // licensed 23 Nov 2026; replaced 26924506 the same day (not festive enough).
    image: {
      src: '/images/stock/hero-christmas-table.webp',
      alt: 'A Christmas dinner table with a roast turkey, crackers, candles, a pine-cone centrepiece, stuffing, vegetables and cranberry sauce',
      width: 2000,
      height: 1568,
    },
    eyebrow: 'Christmas at Absolute Catering',
    heading: 'Christmas dinner, sorted',
    body: 'Turkey, ham and stuffing, roast potatoes, sprouts and cocktail sausages, plus the foil, turkey trays and plates to serve it on. Delivered in our refrigerated van within 30 miles of Omagh, or ready to collect from the store.',
    favourites: {
      heading: 'Christmas favourites',
      items: [
        { slug: 'turkey-ham-stuffing-6-pack', label: 'Turkey, ham & stuffing' },
        { slug: 'mc-cain-roast-potatoes', label: 'Roast potatoes' },
        { slug: 'ardo-brussels-sprouts-2-5kg', label: 'Brussels sprouts' },
        { slug: 'cocktail-sausages-20', label: 'Cocktail sausages' },
        { slug: '75-meter-aluminium-foil', label: 'Foil' },
      ],
    },
  },
};

/**
 * Current month (1–12) in UK time. Set HERO_MONTH (1–12) to preview another
 * month's hero locally or on a Preview deployment; never set it in Production.
 */
export function ukMonth(now = new Date()): number {
  const forced = Number(process.env.HERO_MONTH);
  if (Number.isInteger(forced) && forced >= 1 && forced <= 12) return forced;
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', month: 'numeric' }).format(now));
}
