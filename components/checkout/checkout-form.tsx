'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { Lock, Store, Truck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useBasket } from '@/components/basket/basket-provider';
import type { BasketProduct } from '@/components/basket/basket-view';
import { startCheckout } from '@/app/checkout/actions';
import { deliveryChargePence, deliveryMinimumPence } from '@/content/delivery';

type Slot = { id: string; type: 'delivery' | 'collection'; startsAt: string; endsAt: string; left: number };

const gbp = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);
const tz = { timeZone: 'Europe/London' } as const;
const dayLabel = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { ...tz, weekday: 'short', day: 'numeric', month: 'short' });
const time = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { ...tz, hour: 'numeric', minute: '2-digit' }).replace(':00', '').replace(' ', '');

const input = 'mt-1 block min-h-11 w-full rounded-md border border-line-strong bg-ground px-3';

export function CheckoutForm({
  catalogue,
  slots,
  demoSlots,
}: {
  catalogue: Record<string, BasketProduct>;
  slots: Slot[];
  demoSlots: boolean;
}) {
  const { lines } = useBasket();
  const [fulfilment, setFulfilment] = useState<'delivery' | 'collection'>('delivery');
  const [slotId, setSlotId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [pending, start] = useTransition();

  const priced = lines.flatMap((l) => (catalogue[l.slug] ? [{ ...l, p: catalogue[l.slug]! }] : []));
  const subtotal = priced.reduce((n, l) => n + l.p.pricePence * l.qty, 0);
  const deliveryPence = fulfilment === 'delivery' ? deliveryChargePence : 0;
  const total = subtotal + deliveryPence;
  // How far short of the delivery minimum the basket is (0 once it's met).
  const shortfall = Math.max(0, deliveryMinimumPence - subtotal);
  const blocked = fulfilment === 'delivery' && shortfall > 0;

  // Slots for the chosen method, grouped by day for the grid.
  const days = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots.filter((s) => s.type === fulfilment)) {
      const k = dayLabel(s.startsAt);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return [...map.entries()];
  }, [slots, fulfilment]);

  if (priced.length === 0) {
    return (
      <p className="mt-8 text-lg">
        Your basket is empty. <Link href="/shop" className="font-semibold text-accent underline">Browse the aisles</Link>
      </p>
    );
  }

  function onSubmit(form: FormData) {
    setError('');
    if (blocked) {
      setError(`Delivery needs a minimum spend of ${gbp(deliveryMinimumPence)}. Add ${gbp(shortfall)} more, or choose click & collect.`);
      return;
    }
    if (!slotId) {
      setError('Please choose a slot.');
      return;
    }
    start(async () => {
      const result = await startCheckout({
        lines: priced.map((l) => ({ slug: l.slug, qty: l.qty })),
        fulfilment,
        slotId,
        phone: String(form.get('phone') ?? ''),
        address:
          fulfilment === 'delivery'
            ? {
                line1: String(form.get('line1') ?? ''),
                line2: String(form.get('line2') ?? ''),
                town: String(form.get('town') ?? ''),
                postcode: String(form.get('postcode') ?? ''),
              }
            : undefined,
      });
      if ('url' in result) window.location.assign(result.url);
      else setError(result.error);
    });
  }

  const choice = (on: boolean) =>
    cn('flex flex-1 cursor-pointer items-start gap-3 rounded-md border-2 p-4', on ? 'border-accent bg-teal-soft' : 'border-line-strong');

  return (
    <form action={onSubmit} className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-10">
        <fieldset>
          <legend className="font-display text-xl font-semibold">1. Delivery or collection</legend>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className={choice(fulfilment === 'delivery')}>
              <input type="radio" name="fulfilment" value="delivery" checked={fulfilment === 'delivery'} onChange={() => { setFulfilment('delivery'); setSlotId(''); }} className="mt-1 size-5 accent-accent" />
              <span><span className="flex items-center gap-2 font-semibold"><Truck aria-hidden="true" className="size-5 text-brand" />Delivery</span><span className="block text-sm text-ink-muted">Within 30 miles of Omagh, in our refrigerated van</span><span className="mt-1 block text-sm font-semibold">{gbp(deliveryChargePence)} · minimum spend {gbp(deliveryMinimumPence)}</span></span>
            </label>
            <label className={choice(fulfilment === 'collection')}>
              <input type="radio" name="fulfilment" value="collection" checked={fulfilment === 'collection'} onChange={() => { setFulfilment('collection'); setSlotId(''); }} className="mt-1 size-5 accent-accent" />
              <span><span className="flex items-center gap-2 font-semibold"><Store aria-hidden="true" className="size-5 text-brand" />Click &amp; collect</span><span className="block text-sm text-ink-muted">From the store at Gortrush, Omagh</span><span className="mt-1 block text-sm font-semibold">Free · no minimum spend</span></span>
            </label>
          </div>
          {blocked && (
            <p role="status" className="mt-3 rounded-md border-l-4 border-notice-line bg-notice p-3 text-sm">
              Delivery needs a minimum spend of {gbp(deliveryMinimumPence)}. Add <strong>{gbp(shortfall)}</strong> more to your basket, or
              choose click &amp; collect, which has no minimum.{' '}
              <Link href="/basket" className="font-semibold underline">Back to basket</Link>
            </p>
          )}
        </fieldset>

        {fulfilment === 'delivery' && (
          <fieldset>
            <legend className="font-display text-xl font-semibold">2. Delivery address</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label htmlFor="line1" className="text-sm font-semibold">Address line 1</label><input id="line1" name="line1" autoComplete="address-line1" required className={input} /></div>
              <div className="sm:col-span-2"><label htmlFor="line2" className="text-sm font-semibold">Address line 2 <span className="font-normal text-ink-muted">(optional)</span></label><input id="line2" name="line2" autoComplete="address-line2" className={input} /></div>
              <div><label htmlFor="town" className="text-sm font-semibold">Town</label><input id="town" name="town" autoComplete="address-level2" required className={input} /></div>
              <div><label htmlFor="postcode" className="text-sm font-semibold">Postcode</label><input id="postcode" name="postcode" autoComplete="postal-code" required className={cn(input, 'uppercase')} /></div>
              <div className="sm:col-span-2"><label htmlFor="phone" className="text-sm font-semibold">Phone, for the driver</label><input id="phone" name="phone" type="tel" autoComplete="tel" className={input} /></div>
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="font-display text-xl font-semibold">{fulfilment === 'delivery' ? '3. Delivery slot' : '2. Collection time'}</legend>
          {demoSlots && <p className="mt-2 text-sm text-ink-muted">These are demo times until the shop confirms its real slots.</p>}
          {days.length === 0 ? (
            <p className="mt-4 rounded-md border border-line bg-ground-subtle p-4">No slots are available in the next few days. Please call us on 028 8224 8104.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {days.map(([day, list]) => (
                <div key={day} className="rounded-md border border-line p-3">
                  <p className="font-semibold">{day}</p>
                  <ul className="mt-2 space-y-2">
                    {list.map((s) => {
                      const full = s.left <= 0;
                      const on = slotId === s.id;
                      return (
                        <li key={s.id}>
                          <label className={cn('flex min-h-11 items-center justify-between gap-2 rounded-md border px-3', full ? 'cursor-not-allowed border-line text-ink-muted' : 'cursor-pointer', on ? 'border-2 border-accent bg-teal-soft' : !full && 'border-line-strong hover:border-ink')}>
                            <span className="flex items-center gap-2">
                              <input type="radio" name="slot" value={s.id} disabled={full} checked={on} onChange={() => setSlotId(s.id)} className="size-4 accent-accent" />
                              <span className="font-medium tabular-nums">{time(s.startsAt)}–{time(s.endsAt)}</span>
                            </span>
                            <span className="text-xs">{full ? 'Full' : s.left <= 2 ? `${s.left} left` : ''}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </fieldset>
      </div>

      <aside aria-label="Order summary" className="rounded-md border border-line bg-ground-subtle p-6 lg:sticky lg:top-6">
        <h2 className="font-display text-xl font-semibold">Your order</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {priced.map((l) => (
            <li key={l.slug} className="flex justify-between gap-4"><span>{l.qty} × {l.p.name}</span><span className="tabular-nums">{gbp(l.p.pricePence * l.qty)}</span></li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt>Items</dt><dd className="tabular-nums">{gbp(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>{fulfilment === 'delivery' ? 'Delivery' : 'Click & collect'}</dt><dd className="tabular-nums">{deliveryPence > 0 ? gbp(deliveryPence) : 'Free'}</dd></div>
        </dl>
        <div className="mt-3 flex justify-between border-t border-line pt-3 text-lg font-bold"><span>Total</span><span className="tabular-nums">{gbp(total)}</span></div>
        <p className="mt-2 text-xs text-ink-muted">Your card is held for this amount and charged only for what we pick. <Link href="/payments" className="underline">How payment works</Link></p>
        {error && <p role="alert" className="mt-4 rounded-md border-l-4 border-notice-line bg-notice p-3 text-sm">{error}</p>}
        <button type="submit" disabled={pending || blocked} className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-lg font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60">
          <Lock aria-hidden="true" className="size-4" />{pending ? 'Opening secure payment…' : 'Continue to payment'}
        </button>
        <p className="mt-3 text-center text-xs text-ink-muted">Payments are handled by Stripe.</p>
      </aside>
    </form>
  );
}
