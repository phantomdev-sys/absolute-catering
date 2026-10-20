import legacyCategories from '../data/seed/legacy-categories.json' with { type: 'json' };
import { aisles } from '../content/taxonomy.ts';

/**
 * Permanent redirects from the WooCommerce site.
 *
 * Built from the same taxonomy the shop uses, so a legacy URL can never point
 * at a shelf that no longer exists. Product URLs need nothing here: they keep
 * the WooCommerce shape, /product/<slug> (Next drops the trailing slash itself).
 *
 * Imported by next.config.ts, so relative paths only — no "@/" alias.
 */

export type Redirect = { source: string; destination: string; permanent: true };

function shelfPathFor(legacySlug: string): string | null {
  // Gluten-free chicken also sits on Frozen › Chicken; its old category page
  // was a gluten-free one, so send it to the Gluten Free aisle.
  const ordered = legacySlug.startsWith('gluten-free') || legacySlug === 'flour'
    ? [...aisles].sort((a) => (a.slug === 'gluten-free' ? -1 : 1))
    : aisles;
  for (const aisle of ordered) {
    if (aisle.legacyTop === legacySlug) return `/shop/${aisle.slug}`;
    const shelf = aisle.shelves.find((s) => s.legacy.includes(legacySlug));
    if (shelf) return `/shop/${aisle.slug}/${shelf.slug}`;
  }
  return null;
}

const SPECIAL: Record<string, string> = {
  'absolute-range': '/absolute-range',
  miscellaneous: '/shop/household',
  'plastic-cups': '/shop/household/cups-glasses-and-straws',
};

/** WordPress pages that acted as category landing pages, plus the core pages. */
const PAGES: Record<string, string> = {
  '/bacon': '/shop/fresh/bacon',
  '/chicken': '/shop/fresh/chicken-and-kebabs',
  '/chicken-goujons': '/shop/frozen/chicken',
  '/chicken-chunks': '/shop/frozen/chicken',
  '/chips': '/shop/frozen/chips-and-potatoes',
  '/potato-cubes': '/shop/frozen/chips-and-potatoes',
  '/pre-cut-washed-potatoes': '/shop/frozen/chips-and-potatoes',
  // The old mega-menu linked this one with a capital P.
  '/Pre-cut-washed-potatoes': '/shop/frozen/chips-and-potatoes',
  '/burgers': '/shop/fresh/burgers',
  '/aluminium-foils': '/shop/household/foil-and-trays',
  '/foil-trays': '/shop/household/foil-and-trays',
  '/plastic-food-wrap': '/shop/household',
  '/all-fresh-goods': '/shop/fresh',
  '/all-frozen-goods': '/shop/frozen',
  '/all-gluten-free': '/shop/gluten-free',
  '/all-household-packaging': '/shop/household',
  '/all-seasonal': '/shop/seasonal',
  '/christmas-props': '/shop/seasonal',
  '/christmas-decorations': '/shop/seasonal',
  // Pages that existed with no products on them. Repoint if those ranges go online.
  '/pre-pack-dinners': '/shop/fresh',
  '/ham': '/shop/fresh',
  '/butter': '/shop/fresh',
  '/cheese': '/shop/fresh',
  '/cart': '/basket',
  // WooCommerce's /checkout needs no redirect: the new checkout lives there.
  '/my-account': '/account',
  '/contact-us': '/contact',
  '/about-us': '/about',
  '/terms-conditions': '/terms',
  '/privacy-policy': '/privacy',
  '/privacy-policy-2': '/privacy',
  '/home': '/',
  '/sample-page': '/',
};

export function legacyRedirects(): Redirect[] {
  const out: Redirect[] = [];
  for (const c of legacyCategories) {
    const destination = SPECIAL[c.slug] ?? shelfPathFor(c.slug) ?? '/shop';
    out.push({ source: c.legacy_path.replace(/\/$/, ''), destination, permanent: true });
  }
  for (const [source, destination] of Object.entries(PAGES)) {
    out.push({ source, destination, permanent: true });
  }
  // Anything under the old category tree that isn't listed above.
  out.push({ source: '/product-category/:path*', destination: '/shop', permanent: true });
  return out;
}
