/**
 * Products the shop asks customers to confirm their age for (decision 6 Nov
 * 2026, Ciaran: energy drinks, "just ask customers to confirm their age").
 * It's a declaration at checkout, not ID verification: the customer ticks a
 * box, the server refuses the order without it, and the order history records
 * it. Add category slugs here to cover more products.
 */
export const AGE_RESTRICTED_CATEGORIES = ['energy-drinks'] as const;
export const MINIMUM_AGE = 16;

export function isAgeRestricted(p: { legacyCategories: readonly string[] }): boolean {
  return p.legacyCategories.some((c) => (AGE_RESTRICTED_CATEGORIES as readonly string[]).includes(c));
}
