import type { Product } from '@/lib/catalogue';
import { ProductCard } from './product-card';

/**
 * A ruled grid: one-pixel gaps over a line-coloured background draw the rules
 * between tiles, so the rules stay crisp at every column count without
 * per-tile border bookkeeping.
 */
export function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-3 xl:grid-cols-5">
      {products.map((p, i) => (
        <li key={p.slug} className="bg-ground">
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
