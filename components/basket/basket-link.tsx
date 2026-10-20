'use client';

import Link from 'next/link';
import { ShoppingBasket } from 'lucide-react';
import { useBasket } from './basket-provider';

/** Header basket link with a live item count. */
export function BasketLink() {
  const { count } = useBasket();
  return (
    <Link
      href="/basket"
      className="relative inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong px-4 font-semibold hover:border-ink"
    >
      <ShoppingBasket aria-hidden="true" className="size-5" />
      Basket
      {count > 0 && (
        <span className="ml-1 inline-flex min-w-6 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold tabular-nums text-brand-ink">
          {count}
          <span className="sr-only">{count === 1 ? ' item' : ' items'}</span>
        </span>
      )}
    </Link>
  );
}
