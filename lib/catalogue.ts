import seed from '@/data/seed/products.json';
import { aisles, shelfOverrides, legacyBrandCategory, type Aisle, type Shelf } from '@/content/taxonomy';
import { publicClient } from '@/lib/supabase/public';

/**
 * Catalogue data access.
 *
 * Reads Supabase when it is configured and reachable, and falls back to the
 * seed scraped from the WooCommerce site on 20 Oct 2026 otherwise. The seed is
 * the real product list, not sample data, so previews built without secrets
 * still show the actual range.
 *
 * Everything commercial or food-safety related (price, VAT, pack size,
 * ingredients, allergens) is nullable and stays null until the client supplies
 * it. The UI must render "awaiting" states, never a guess.
 */

export type Allergen =
  | 'celery'
  | 'cereals containing gluten'
  | 'crustaceans'
  | 'eggs'
  | 'fish'
  | 'lupin'
  | 'milk'
  | 'molluscs'
  | 'mustard'
  | 'tree nuts'
  | 'peanuts'
  | 'sesame'
  | 'soya'
  | 'sulphur dioxide and sulphites';

export type Storage = 'frozen' | 'chilled' | 'ambient';

export type Product = {
  slug: string;
  name: string;
  legacyId: number;
  legacyCategories: string[];
  ownBrand: boolean;
  /** Pence, VAT inclusive. Null until the client confirms it. */
  pricePence: number | null;
  packSize: string | null;
  description: string | null;
  storage: Storage | null;
  ingredients: string | null;
  allergens: { contains: Allergen[]; mayContain: Allergen[] } | null;
  /** Name of the person who signed the allergen data off, once they have. */
  allergenSignoff: string | null;
  status: 'awaiting_client' | 'ready' | 'live' | 'withdrawn';
};

type SeedRow = (typeof seed)[number];

function fromSeed(row: SeedRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    legacyId: row.legacy_wc_id,
    legacyCategories: row.legacy_categories,
    ownBrand: row.own_brand,
    // Deliberately not reading legacy_price_pence_unverified: it was never
    // confirmed and must not reach the page.
    pricePence: null,
    packSize: null,
    description: null,
    storage: null,
    ingredients: null,
    allergens: null,
    allergenSignoff: null,
    status: 'awaiting_client',
  };
}

const seedProducts: Product[] = seed.map(fromSeed).sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));

export async function getProducts(): Promise<Product[]> {
  const supabase = publicClient();
  if (!supabase) return seedProducts;
  // RLS only returns live products to the public, so until the first product is
  // signed off (or when the network is blocked) the seed keeps every route working.
  const { data, error } = await supabase
    .from('products')
    .select('slug, name, legacy_wc_id, legacy_categories, own_brand, price_pence, pack_size, description, storage, ingredients, allergen_signed_off_by, status, product_allergens(allergen, level)');
  if (error || !data || data.length === 0) return seedProducts;
  return (data as unknown as DbRow[]).map(fromDb).sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
}

type DbRow = {
  slug: string;
  name: string;
  legacy_wc_id: number | null;
  legacy_categories: string[];
  own_brand: boolean;
  price_pence: number | null;
  pack_size: string | null;
  description: string | null;
  storage: Storage | null;
  ingredients: string | null;
  allergen_signed_off_by: string | null;
  status: Product['status'];
  product_allergens: { allergen: Allergen; level: 'contains' | 'may_contain' }[];
};

function fromDb(r: DbRow): Product {
  const signedOff = r.allergen_signed_off_by != null;
  return {
    slug: r.slug,
    name: r.name,
    legacyId: r.legacy_wc_id ?? 0,
    legacyCategories: r.legacy_categories,
    ownBrand: r.own_brand,
    pricePence: r.price_pence,
    packSize: r.pack_size,
    description: r.description,
    storage: r.storage,
    ingredients: r.ingredients,
    // Allergens are only shown once someone has signed them off; an unsigned
    // list is treated as unknown, never as "none".
    allergens: signedOff
      ? {
          contains: r.product_allergens.filter((a) => a.level === 'contains').map((a) => a.allergen),
          mayContain: r.product_allergens.filter((a) => a.level === 'may_contain').map((a) => a.allergen),
        }
      : null,
    allergenSignoff: r.allergen_signed_off_by,
    status: r.status,
  };
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

/** Where a product sits: every aisle/shelf it appears on. */
export type Placement = { aisle: Aisle; shelf: Shelf | null };

export function placementsFor(product: Product): Placement[] {
  const out: Placement[] = [];
  const overrides = shelfOverrides[product.slug] ?? [];

  for (const aisle of aisles) {
    const override = overrides.find((o) => o.aisle === aisle.slug);
    if (override) {
      out.push({ aisle, shelf: aisle.shelves.find((s) => s.slug === override.shelf) ?? null });
      continue;
    }
    // WooCommerce never reused a slug across aisles (Frozen's are suffixed,
    // e.g. "sausages-frozen-food"), so a shelf match alone places a product.
    const shelf = aisle.shelves.find((s) => s.legacy.some((l) => product.legacyCategories.includes(l)));
    if (shelf || product.legacyCategories.includes(aisle.legacyTop)) {
      out.push({ aisle, shelf: shelf ?? null });
    }
  }
  return out;
}

export function primaryPlacement(product: Product): Placement | undefined {
  const all = placementsFor(product);
  // Gluten Free is a dietary view of products that also live elsewhere, so it
  // is only the "home" aisle when there is no other.
  return all.find((p) => p.aisle.slug !== 'gluten-free') ?? all[0];
}

export async function getAisleProducts(aisleSlug: string, shelfSlug?: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) =>
    placementsFor(p).some(
      (pl) => pl.aisle.slug === aisleSlug && (!shelfSlug || pl.shelf?.slug === shelfSlug),
    ),
  );
}

export async function getOwnBrand(): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.ownBrand || p.legacyCategories.includes(legacyBrandCategory));
}

export function getAisle(slug: string): Aisle | undefined {
  return aisles.find((a) => a.slug === slug);
}

export async function aisleCounts(): Promise<Record<string, number>> {
  const products = await getProducts();
  const counts: Record<string, number> = {};
  for (const a of aisles) {
    counts[a.slug] = products.filter((p) => placementsFor(p).some((pl) => pl.aisle.slug === a.slug)).length;
    for (const s of a.shelves) {
      counts[`${a.slug}/${s.slug}`] = products.filter((p) =>
        placementsFor(p).some((pl) => pl.aisle.slug === a.slug && pl.shelf?.slug === s.slug),
      ).length;
    }
  }
  return counts;
}

/** Plain, forgiving search: every word must appear in the name or its shelves. */
export async function searchProducts(query: string): Promise<Product[]> {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const products = await getProducts();
  return products.filter((p) => {
    const haystack = [
      p.name,
      ...placementsFor(p).flatMap((pl) => [pl.aisle.name, pl.shelf?.name ?? '']),
      p.ownBrand ? 'absolute range own brand' : '',
    ]
      .join(' ')
      .toLowerCase();
    return words.every((w) => haystack.includes(w.replace(/s$/, '')));
  });
}

export async function relatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const home = primaryPlacement(product);
  if (!home) return [];
  const siblings = await getAisleProducts(home.aisle.slug, home.shelf?.slug);
  const pool = siblings.length > 1 ? siblings : await getAisleProducts(home.aisle.slug);
  return pool.filter((p) => p.slug !== product.slug).slice(0, limit);
}

export function formatPrice(pence: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);
}
