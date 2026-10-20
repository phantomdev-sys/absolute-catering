'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useBasket } from '@/components/basket/basket-provider';

/** "Add everything from this order to my basket" — the big grocers' killer feature. */
export function BuyAgainAll({ items }: { items: { slug: string; qty: number }[] }) {
  const { qtyOf, setQty } = useBasket();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        for (const i of items) setQty(i.slug, qtyOf(i.slug) + i.qty);
        setDone(true);
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong px-4 font-semibold hover:border-ink"
    >
      <RotateCcw aria-hidden="true" className="size-4" />
      <span aria-live="polite">{done ? 'Added to basket' : 'Buy this order again'}</span>
    </button>
  );
}
