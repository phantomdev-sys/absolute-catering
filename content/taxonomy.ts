/**
 * The shop's aisles and shelves.
 *
 * WooCommerce had 42 categories, many holding a single product, with the same
 * names reused across Fresh and Frozen ("Pizza", "Sausages"). Shoppers think
 * in aisles and shelves, so this collapses them into a small, predictable
 * structure. Each shelf lists the legacy WooCommerce category slugs it absorbs,
 * which is also what drives the 301 redirects (lib/redirects.ts) — one mapping,
 * so a product can never be reachable by a URL that redirects somewhere else.
 *
 * "Absolute Range" is a brand, not an aisle: it's a flag on the product and has
 * its own landing page. "Miscellaneous" was a catch-all and is dropped.
 */

export type Shelf = {
  slug: string;
  name: string;
  legacy: string[];
};

export type Aisle = {
  slug: string;
  name: string;
  /** One line under the aisle name. Plain description, no claims. */
  blurb: string;
  /** Legacy top-level category this aisle replaces. */
  legacyTop: string;
  shelves: Shelf[];
};

export const aisles: Aisle[] = [
  {
    slug: 'fresh',
    name: 'Fresh',
    blurb: 'Bacon, sausages, chicken, burgers, eggs and desserts.',
    legacyTop: 'fresh-food',
    shelves: [
      { slug: 'bacon', name: 'Bacon', legacy: ['fresh-bacon'] },
      { slug: 'sausages-and-puddings', name: 'Sausages & puddings', legacy: ['sausages', 'black-pudding', 'white-pudding'] },
      { slug: 'chicken-and-kebabs', name: 'Chicken & kebabs', legacy: ['fresh-chicken', 'kebab'] },
      { slug: 'burgers', name: 'Burgers', legacy: ['burgers'] },
      { slug: 'eggs', name: 'Eggs', legacy: ['eggs'] },
      { slug: 'cakes-and-desserts', name: 'Cakes & desserts', legacy: ['cakes'] },
      { slug: 'pizza', name: 'Pizza', legacy: ['pizza'] },
    ],
  },
  {
    slug: 'frozen',
    name: 'Frozen',
    blurb: 'Chicken, chips and potatoes, pizza and party food.',
    legacyTop: 'frozen-food',
    shelves: [
      // The gluten-free chicken lines are frozen too; they also appear in the
      // Gluten Free aisle.
      { slug: 'chicken', name: 'Chicken', legacy: ['chicken-fillets', 'frozen-goujons', 'gluten-free-chicken'] },
      {
        slug: 'chips-and-potatoes',
        name: 'Chips & potatoes',
        legacy: ['frozen-chips', 'potato-cubes', 'frozen-pre-cut-and-washed-potatoes', 'baked-potatoes'],
      },
      {
        slug: 'pizza-and-snacks',
        name: 'Pizza & snacks',
        legacy: ['pizza-frozen-food', 'mozzarella-bites', 'sausage-rolls', 'sausages-frozen-food'],
      },
      { slug: 'kebab-meat', name: 'Kebab meat', legacy: ['kebab-meat'] },
      { slug: 'turkey', name: 'Turkey', legacy: ['turkey', 'turkey-burgers'] },
    ],
  },
  {
    slug: 'gluten-free',
    name: 'Gluten Free',
    blurb: 'Gluten-free chicken, turkey, flour and desserts.',
    legacyTop: 'gluten-free',
    shelves: [
      { slug: 'chicken-and-turkey', name: 'Chicken & turkey', legacy: ['gluten-free-chicken', 'gluten-free-turkey'] },
      { slug: 'baking', name: 'Baking', legacy: ['flour'] },
      // The cheesecake is only tagged "cakes" + "gluten-free"; see shelfOverrides.
      { slug: 'desserts', name: 'Desserts', legacy: [] },
    ],
  },
  {
    slug: 'household',
    name: 'Household & Packaging',
    blurb: 'Foil, cups, plates, cutlery, blue roll and bits for the home.',
    legacyTop: 'household-packaging',
    shelves: [
      { slug: 'foil-and-trays', name: 'Foil & trays', legacy: ['aluminium-foil'] },
      { slug: 'cups-glasses-and-straws', name: 'Cups, glasses & straws', legacy: ['paper-cups', 'plastic-cups', 'plastic-glasses', 'straws'] },
      { slug: 'plates-and-cutlery', name: 'Plates & cutlery', legacy: ['paper-plates', 'cutlery'] },
      { slug: 'paper-and-cleaning', name: 'Paper & cleaning', legacy: ['blue-roll'] },
      { slug: 'for-the-home', name: 'For the home', legacy: ['for-the-home'] },
    ],
  },
  {
    slug: 'seasonal',
    name: 'Seasonal',
    blurb: 'Christmas and seasonal lines while they last.',
    legacyTop: 'seasonal',
    shelves: [],
  },
];

/**
 * Products whose WooCommerce categories don't place them on a shelf. Each one
 * is an obvious call, written down so it reads as a decision, not an accident.
 */
export const shelfOverrides: Record<string, { aisle: string; shelf: string }[]> = {
  // Only tagged "frozen-food".
  'diggers-boneless-wings': [{ aisle: 'frozen', shelf: 'chicken' }],
  // Tagged household + seasonal; foil trays belong with foil all year.
  'turkey-trays': [{ aisle: 'household', shelf: 'foil-and-trays' }],
  'gluten-free-cheese-cake': [{ aisle: 'gluten-free', shelf: 'desserts' }],
};

/** Legacy categories that are not aisles or shelves. */
export const legacyBrandCategory = 'absolute-range';
