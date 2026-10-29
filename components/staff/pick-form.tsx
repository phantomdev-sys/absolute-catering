'use client';

import { useActionState, useState } from 'react';
import { Check, Printer, X } from 'lucide-react';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { chargeFor } from '@/lib/picking';
import { pickAction, type StaffState } from '@/app/staff/actions';

type Line = { id: string; name: string; pricePence: number; qty: number; pickedQty: number | null };

const gbp = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);

/**
 * The picker's checklist. Every line starts at the quantity ordered (most
 * lines are picked in full); the picker lowers it for anything short. The
 * total updates as they go, and charging needs a second, explicit tap that
 * names the amount, because it takes money from a real card.
 */
export function PickForm({
  orderId,
  lines,
  deliveryPence,
  heldPence,
  fulfilment,
}: {
  orderId: string;
  lines: Line[];
  deliveryPence: number;
  heldPence: number;
  fulfilment: 'delivery' | 'collection';
}) {
  const [state, action, pending] = useActionState<StaffState, FormData>(pickAction, {});
  const [picked, setPicked] = useState<Record<string, number>>(() =>
    Object.fromEntries(lines.map((l) => [l.id, l.pickedQty ?? l.qty])),
  );
  const [confirming, setConfirming] = useState(false);
  const charge = chargeFor(
    lines.map((l) => ({ pricePence: l.pricePence, qty: l.qty, pickedQty: picked[l.id] ?? 0 })),
    deliveryPence,
  );
  const short = lines.filter((l) => (picked[l.id] ?? 0) < l.qty).length;
  const set = (id: string, v: number) => {
    setConfirming(false);
    setPicked((p) => ({ ...p, [id]: v }));
  };

  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="order_id" value={orderId} />
      {(state.error || state.notice) && (
        <p
          role={state.error ? 'alert' : 'status'}
          className={`mb-4 rounded-md border-l-4 p-3 ${state.error ? 'border-notice-line bg-notice' : 'border-accent bg-teal-soft'}`}
        >
          {state.error ?? state.notice}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-ink-muted">Set each line to what you’ve actually got. Anything at 0 is marked unavailable and not charged.</p>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong px-4 font-semibold hover:border-ink"
        >
          <Printer aria-hidden="true" className="size-4" /> Print picking list
        </button>
      </div>

      <ul className="mt-4 divide-y divide-line border-y border-line">
        {lines.map((l) => {
          const v = picked[l.id] ?? 0;
          const state = v === l.qty ? 'full' : v === 0 ? 'none' : 'part';
          return (
            <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <input type="hidden" name={`picked_${l.id}`} value={v} />
              <span aria-hidden="true" className="hidden size-6 shrink-0 rounded border-2 border-ink print:inline-block" />
              <span className="min-w-0 flex-1 basis-48">
                <span className="block font-semibold">
                  <span className="tabular-nums">{l.qty} ×</span> {l.name}
                </span>
                <span className="block text-sm text-ink-muted">
                  {gbp(l.pricePence)} each
                  {state === 'none' && <strong className="ml-2 text-brand">Unavailable</strong>}
                  {state === 'part' && <strong className="ml-2 text-brand">Short by {l.qty - v}</strong>}
                </span>
              </span>
              <span className="flex items-center gap-2 print:hidden">
                <QuantityStepper
                  value={v}
                  onValueChange={(n) => set(l.id, n)}
                  min={0}
                  max={l.qty}
                  label={`Picked quantity of ${l.name}`}
                />
                <button
                  type="button"
                  onClick={() => set(l.id, v === 0 ? l.qty : 0)}
                  className="inline-flex min-h-11 min-w-24 items-center justify-center gap-1 rounded-md border border-line-strong px-3 text-sm font-semibold hover:border-ink"
                >
                  {v === 0 ? (
                    <><Check aria-hidden="true" className="size-4" /> Got all</>
                  ) : (
                    <><X aria-hidden="true" className="size-4" /> None</>
                  )}
                </button>
              </span>
              <span className="ml-auto w-20 text-right tabular-nums font-semibold print:hidden">{gbp(l.pricePence * v)}</span>
            </li>
          );
        })}
      </ul>

      <dl className="mt-4 space-y-1 print:hidden">
        <div className="flex justify-between"><dt>Picked items</dt><dd className="tabular-nums">{gbp(charge.subtotal)}</dd></div>
        {fulfilment === 'delivery' && (
          <div className="flex justify-between"><dt>Delivery</dt><dd className="tabular-nums">{gbp(charge.delivery)}</dd></div>
        )}
        <div className="flex justify-between text-lg font-bold"><dt>To charge</dt><dd className="tabular-nums">{gbp(charge.total)}</dd></div>
        <div className="flex justify-between text-sm text-ink-muted"><dt>Held on the card</dt><dd className="tabular-nums">{gbp(heldPence)}</dd></div>
      </dl>
      {short > 0 && (
        <p className="mt-2 text-sm print:hidden">
          {short} line{short === 1 ? ' is' : 's are'} short. The customer is only charged for what’s picked; the rest of the hold drops off their card.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <button
          type="submit"
          name="intent"
          value="save"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-md border border-line-strong px-5 font-semibold hover:border-ink disabled:opacity-60"
        >
          Save progress
        </button>
        {charge.total === 0 ? (
          <p className="self-center text-sm">Nothing picked. Use “Cancel order” below to release the card hold.</p>
        ) : !confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={pending}
            className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
          >
            Finish picking and charge {gbp(charge.total)}
          </button>
        ) : (
          <span className="flex flex-wrap items-center gap-3 rounded-md bg-teal-soft p-2">
            <span className="px-2 font-semibold">Charge the card {gbp(charge.total)}?</span>
            <button
              type="submit"
              name="intent"
              value="finish"
              disabled={pending}
              className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
            >
              {pending ? 'Charging…' : 'Yes, charge it'}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="min-h-11 px-3 font-semibold underline">
              Not yet
            </button>
          </span>
        )}
      </div>

      <details className="mt-8 rounded-md border border-line p-4 print:hidden">
        <summary className="cursor-pointer font-semibold">Cancel order</summary>
        <p className="mt-2 text-sm text-ink-muted">
          Releases the hold on the customer’s card (nothing is charged) and frees their slot. Can’t be undone.
        </p>
        <label htmlFor="reason" className="mt-3 block text-sm font-semibold">Reason <span className="font-normal text-ink-muted">(for our records)</span></label>
        <input id="reason" name="reason" className="mt-1 block min-h-11 w-full rounded-md border border-line-strong bg-ground px-3" />
        <button
          type="submit"
          name="intent"
          value="cancel"
          disabled={pending}
          className="mt-3 inline-flex min-h-11 items-center rounded-md border-2 border-notice-line px-5 font-semibold disabled:opacity-60"
        >
          Cancel order and release the hold
        </button>
      </details>
    </form>
  );
}
