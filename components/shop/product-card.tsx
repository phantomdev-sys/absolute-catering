import Link from 'next/link';
import type { Product } from '@/lib/catalogue';
import { ProductImage } from './product-image';
import { Price } from './price';
import { OwnBrandBadge } from './own-brand-badge';

/**
 * Product tile.
 *
 * Layout follows the 21st.dev "Product Listing Card" (shadcnstore): image
 * well, title, price, action, in a fixed order so a row of tiles scans as a
 * shelf. Restyled to Direction B — no boxed card or shadow; tiles sit on a
 * ruled grid like a label sheet (the grid draws the rules, see ProductGrid).
 *
 * The whole tile is one link with the name as its accessible text; the
 * add-to-basket control (Phase 3) will sit outside the link so it stays a
 * separate, focusable button.
 */
export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col bg-ground p-4">
      <ProductImage
        product={product}
        priority={priority}
        sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
        className="rounded-sm"
      />
      <div className="mt-3 flex flex-1 flex-col">
        {product.ownBrand && <OwnBrandBadge className="mb-1.5 self-start" />}
        <h3 className="text-[0.9375rem] font-semibold leading-snug">
          <Link
            href={`/product/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:underline-offset-4 focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>
        {product.packSize && <p className="mt-0.5 text-sm text-ink-muted">{product.packSize}</p>}
        <Price product={product} className="mt-auto pt-3" />
      </div>
      {/* Focus ring for the stretched link, drawn on the tile itself. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-sm outline-offset-[-2px] outline-focus group-has-[:focus-visible]:outline-2"
      />
    </article>
  );
}
