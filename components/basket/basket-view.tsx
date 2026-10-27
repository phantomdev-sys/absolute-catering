'use client';

import Image from 'next/image';
import { deliveryChargePence, deliveryMinimumPence } from '@/content/delivery';
import Link from 'next/link';
import { ArrowRight, Store, Truck } from 'lucide-react';
import { useBasket } from './basket-provider';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { Button } from '@/components/ui/button';

export type BasketProduct = { slug: string; name: string; pricePence: number; ownBrand: boolean };

const gbp = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);

export function BasketView({
  catalogue,
  thumbs,
}: {
  catalogue: Record<string, BasketProduct>;
  thumbs: Record<string, React.ReactNode>;
}) {
  const { lines, setQty, clear } = useBasket();
  // Lines for products that are no longer on sale are dropped from the view
  // (and from the total) rather than priced from stale data.
  const priced = lines.flatMap((l) => {
    const p = catalogue[l.slug];
    return p ? [{ ...l, product: p, linePence: p.pricePence * l.qty }] : [];
  });
  const subtotal = priced.reduce((n, l) => n + l.linePence, 0);
  const items = priced.reduce((n, l) => n + l.qty, 0);

  if (priced.length === 0) {
    return (
      <div className="mt-8 grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="text-xl font-semibold">Your basket is empty.</p>
          <p className="mt-2 text-ink-muted">Add a few things from the aisles and they’ll appear here.</p>
          <div className="mt-6">
            <Button href="/shop">Browse the aisles</Button>
          </div>
        </div>
        <Image
          src="/images/stock/ham-cheese-croissant.webp"
          alt=""
          width={1600}
          height={896}
          sizes="(min-width: 768px) 45vw, 100vw"
          className="h-auto w-full rounded-md"
        />
      </div>
    );
  }

  return (
    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_22rem]">
      <section aria-label="Items in your basket">
        <ul className="divide-y divide-line border-y border-line">
          {priced.map((l) => (
            <li key={l.slug} className="flex items-center gap-4 py-4">
              <Link href={`/product/${l.slug}`} className="shrink-0" tabIndex={-1} aria-hidden="true">
                {thumbs[l.slug]}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${l.slug}`} className="font-semibold hover:underline">
                  {l.product.name}
                </Link>
                <p className="text-sm text-ink-muted tabular-nums">{gbp(l.product.pricePence)} each</p>
              </div>
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-6">
                <QuantityStepper
                  value={l.qty}
                  onValueChange={(v) => setQty(l.slug, v)}
                  min={0}
                  size="sm"
                  removeAtMin
                  label={l.product.name}
                />
                <p className="w-20 text-right font-bold tabular-nums">{gbp(l.linePence)}</p>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" onClick={clear} className="mt-4 min-h-11 text-sm font-semibold text-accent underline underline-offset-4">
          Empty basket
        </button>
      </section>

      <aside aria-label="Order summary" className="rounded-md border border-line bg-ground-subtle p-6 lg:sticky lg:top-6">
        <h2 className="font-display text-xl font-semibold">Summary</h2>
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between">
            <dt>Items ({items})</dt>
            <dd className="font-semibold tabular-nums">{gbp(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-ink-muted">
            <dt>Delivery</dt>
            <dd>{gbp(deliveryChargePence)}, or free click &amp; collect</dd>
          </div>
        </dl>
        {subtotal < deliveryMinimumPence ? (
          <p className="mt-3 rounded-md bg-teal-soft p-3 text-sm">
            Spend <strong>{gbp(deliveryMinimumPence - subtotal)}</strong> more for delivery ({gbp(deliveryMinimumPence)} minimum). Click &amp;
            collect has no minimum.
          </p>
        ) : (
          <p className="mt-3 rounded-md bg-teal-soft p-3 text-sm">You’ve reached the {gbp(deliveryMinimumPence)} minimum for delivery.</p>
        )}
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-bold">
          <span>Items total</span>
          <span className="tabular-nums">{gbp(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Your card is held for this amount and charged only for what we pick.{' '}
          <Link href="/payments" className="underline">How payment works</Link>
        </p>
        <Button href="/checkout" size="lg" className="mt-6 w-full">
          Checkout <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
        <ul className="mt-6 space-y-2 text-sm text-ink-muted">
          <li className="flex gap-2"><Truck aria-hidden="true" className="size-4 shrink-0 text-brand" /> Delivery within 30 miles of Omagh</li>
          <li className="flex gap-2"><Store aria-hidden="true" className="size-4 shrink-0 text-brand" /> Or click &amp; collect at Gortrush</li>
        </ul>
      </aside>
    </div>
  );
}
