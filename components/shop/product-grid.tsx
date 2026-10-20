import type { Product } from '@/lib/catalogue';
import { ProductCard } from './product-card';

/**
 * A ruled grid: each tile draws a one-pixel ring and the 1px gap lets
 * neighbouring rings overlap into a single rule. Unlike a coloured background
 * behind the gaps, an empty last cell (an odd count on a phone) stays blank.
 */
export function ProductGrid({
  products,
  priorityCount = 0,
  variant = 'full',
}: {
  products: Product[];
  priorityCount?: number;
  /** 'compact' fits beside an image: at most three columns. */
  variant?: 'full' | 'compact';
}) {
  return (
    <ul
      className={
        variant === 'compact'
          ? 'grid grid-cols-2 gap-px self-start p-px md:grid-cols-3'
          : 'grid grid-cols-2 gap-px p-px md:grid-cols-3 xl:grid-cols-5'
      }
    >
      {products.map((p, i) => (
        <li key={p.slug} className="bg-ground shadow-[0_0_0_1px_var(--color-line)]">
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
