import type { Product } from '@/lib/catalogue';

/**
 * Ingredients and allergens, set as a back-of-pack label (Direction A's
 * signature, grafted onto B). Allergens are bold in the ingredients list, as
 * UK labelling requires on the pack itself, so the screen matches the box in
 * the customer's hand.
 *
 * Until the client supplies signed-off data the panel says so plainly. It
 * never shows "no allergens" by default — an empty list and an unknown list
 * are different things, and confusing them is how someone gets hurt.
 */
export function AllergenLabel({ product }: { product: Product }) {
  const confirmed = product.ingredients != null && product.allergens != null;

  return (
    <section
      aria-labelledby="label-heading"
      className="border-2 border-ink bg-ground p-5 font-body text-[0.9375rem] leading-relaxed"
    >
      <h2 id="label-heading" className="border-b-2 border-ink pb-2 font-body text-sm font-black uppercase tracking-[0.12em]">
        Ingredients &amp; allergens
      </h2>

      {confirmed ? (
        <>
          <p className="mt-3">
            <span className="font-black uppercase">Ingredients: </span>
            {renderIngredients(product.ingredients!, product.allergens!.contains)}
          </p>
          {product.allergens!.contains.length > 0 && (
            <p className="mt-3">
              <span className="font-black uppercase">Contains: </span>
              <span className="font-bold">{product.allergens!.contains.join(', ')}</span>
            </p>
          )}
          {product.allergens!.mayContain.length > 0 && (
            <p className="mt-1">
              <span className="font-black uppercase">May contain: </span>
              {product.allergens!.mayContain.join(', ')}
            </p>
          )}
          {product.allergenSignoff && (
            <p className="mt-4 border-t border-line pt-2 text-xs text-ink-muted">
              Information checked by {product.allergenSignoff}. Always read the pack before eating.
            </p>
          )}
        </>
      ) : (
        <div className="mt-3 border-l-4 border-notice-line bg-notice p-3">
          <p className="font-semibold">Ingredients and allergen information hasn’t been confirmed yet.</p>
          <p className="mt-1 text-sm">
            It will appear here before this product goes on sale online. If you have an allergy, please check the pack
            or ask us in store.
          </p>
        </div>
      )}
    </section>
  );
}

/** Bold every allergen word that appears in the ingredients text. */
function renderIngredients(text: string, allergens: string[]) {
  const words = allergens.flatMap((a) => a.split(/\s+/)).filter((w) => w.length > 3);
  if (words.length === 0) return text;
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return text.split(re).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}
