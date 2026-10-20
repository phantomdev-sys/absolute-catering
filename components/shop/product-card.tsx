import Link from 'next/link';
import type { Product } from '@/lib/catalogue';
import { ProductImage } from './product-image';
import { Price } from './price';
import { OwnBrandBadge } from './own-brand-badge';
import { AddToBasket } from '@/components/basket/add-to-basket';
import { FavouriteButton } from '@/components/favourites/favourite-button';

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
      <FavouriteButton slug={product.slug} name={product.name} className="absolute right-6 top-6 z-10" />
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
        {/* Stacked on narrow tiles (two columns on a phone), side by side once
            there's room, so the price and the control never collide. */}
        <div className="mt-auto flex flex-col gap-2 pt-3 sm:min-h-10 sm:flex-row sm:items-end sm:justify-between">
          <Price product={product} />
          {product.status === 'live' && product.pricePence != null && (
            // Above the stretched link, so it's its own control.
            <AddToBasket
              slug={product.slug}
              name={product.name}
              className="relative z-10 w-full justify-between sm:w-auto sm:justify-center"
            />
          )}
        </div>
      </div>
      {/* Focus ring for the stretched link, drawn on the tile itself. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-sm outline-offset-[-2px] outline-focus group-has-[:focus-visible]:outline-2"
      />
    </article>
  );
}
