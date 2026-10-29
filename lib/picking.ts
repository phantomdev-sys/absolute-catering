/**
 * What a picked order costs. Pure, so the staff screen (live total) and the
 * server (the amount actually captured) work it out the same way.
 *
 * - Each line is charged for what was picked, never more than was ordered.
 * - The delivery charge stands if anything at all goes out. The customer met
 *   the £50 minimum when they ordered; a shortage on our side doesn't add a
 *   penalty and doesn't remove the van run either.
 * - If nothing could be picked, the charge is zero and the card hold is
 *   released instead of captured.
 */
export type PickLine = { pricePence: number; qty: number; pickedQty: number };

export function pickedSubtotal(lines: PickLine[]): number {
  return lines.reduce((n, l) => n + l.pricePence * clampPick(l.pickedQty, l.qty), 0);
}

export function chargeFor(lines: PickLine[], deliveryPence: number): { subtotal: number; delivery: number; total: number } {
  const subtotal = pickedSubtotal(lines);
  const delivery = subtotal > 0 ? deliveryPence : 0;
  return { subtotal, delivery, total: subtotal + delivery };
}

export function clampPick(picked: number, ordered: number): number {
  if (!Number.isFinite(picked)) return 0;
  return Math.max(0, Math.min(ordered, Math.trunc(picked)));
}

/** Customer-facing status wording; "ready" means different things for a van and a counter. */
export function statusLabel(status: string, fulfilment: 'delivery' | 'collection'): string {
  if (status === 'ready') return fulfilment === 'delivery' ? 'Packed, waiting for the van' : 'Ready to collect';
  return (
    {
      awaiting_payment: 'Awaiting payment',
      authorised: 'Order placed',
      picking: 'Being picked',
      out_for_delivery: 'Out for delivery',
      completed: fulfilment === 'delivery' ? 'Delivered' : 'Collected',
      part_fulfilled: fulfilment === 'delivery' ? 'Delivered (some items unavailable)' : 'Collected (some items unavailable)',
      cancelled: 'Cancelled',
    } as Record<string, string>
  )[status] ?? status;
}

const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London' });
const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' });

/** "Tue 3 Nov, 10:00–12:00" in shop time. */
export function slotText(o: { slot: { startsAt: string; endsAt: string } | null }): string {
  if (!o.slot) return 'No slot';
  const s = new Date(o.slot.startsAt);
  return `${day.format(s)}, ${time.format(s)}–${time.format(new Date(o.slot.endsAt))}`;
}
