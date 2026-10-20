'use client';

import { ShoppingBasket } from 'lucide-react';
import { cn } from '@/lib/cn';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { useBasket } from './basket-provider';

/**
 * "Add" until the product is in the basket, then the stepper — the pattern
 * every big grocer uses, so the quantity can change without leaving the shelf.
 * Taking it to zero removes it and the button comes back.
 */
export function AddToBasket({
  slug,
  name,
  size = 'sm',
  className,
}: {
  slug: string;
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { qtyOf, setQty } = useBasket();
  const qty = qtyOf(slug);

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => setQty(slug, 1)}
        aria-label={`Add ${name} to basket`}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 font-semibold text-accent-ink transition-colors hover:bg-accent-hover',
          size === 'md' ? 'min-h-12 text-base' : 'min-h-10 text-sm',
          className,
        )}
      >
        <ShoppingBasket aria-hidden="true" className="size-4" />
        Add
      </button>
    );
  }

  return (
    <QuantityStepper
      value={qty}
      onValueChange={(v) => setQty(slug, v)}
      min={0}
      max={99}
      size={size}
      removeAtMin
      label={name}
      className={className}
    />
  );
}
