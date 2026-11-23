/**
 * Homepage hero by season. Each entry runs between two dates (inclusive, UK
 * time, every year) and can override the photo, the copy and a short row of
 * "favourites" links; anything left out falls back to the all-year hero
 * (content/home.ts + content/images.ts heroImage). The first matching entry
 * wins. The homepage revalidates hourly, so a hero starts within the hour
 * after midnight on its first day and ends the same way after its last.
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
  /** First and last day it shows, as 'MM-DD' (UK time, every year). */
  from: string;
  to: string;
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

export const seasonalHeroes: SeasonalHero[] = [
  {
    // 23 Nov 2026 (Alex): run Christmas from late November, not 1 December.
    label: 'Christmas',
    from: '11-23',
    to: '12-26',
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
];

/**
 * Today as 'MM-DD' in UK time. Set HERO_DATE ('MM-DD') to preview another
 * date's hero locally or on a Preview deployment; never set it in Production.
 */
export function ukDay(now = new Date()): string {
  const forced = process.env.HERO_DATE;
  if (forced && /^\d{2}-\d{2}$/.test(forced)) return forced;
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('month')}-${get('day')}`;
}

/** The hero running today, if any. 'MM-DD' strings compare correctly as text. */
export function currentSeason(now = new Date()): SeasonalHero | undefined {
  const day = ukDay(now);
  return seasonalHeroes.find((s) => (s.from <= s.to ? s.from <= day && day <= s.to : day >= s.from || day <= s.to));
}
