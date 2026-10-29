'use server';

import { revalidatePath } from 'next/cache';
import { adminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';
import { currentStaff } from '@/lib/staff';
import { chargeFor, clampPick } from '@/lib/picking';

export type StaffState = { error?: string; notice?: string };

const gbp = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);

type OrderRow = {
  id: string;
  number: number;
  status: string;
  fulfilment: 'delivery' | 'collection';
  delivery_pence: number | null;
  total_pence: number;
  stripe_payment_intent_id: string | null;
  slot_id: string | null;
  order_items: { id: string; price_pence: number; qty: number }[];
};

async function load(orderId: string) {
  const admin = adminClient();
  if (!admin) return { admin: null, order: null };
  const { data } = await admin
    .from('orders')
    .select('id, number, status, fulfilment, delivery_pence, total_pence, stripe_payment_intent_id, slot_id, order_items(id, price_pence, qty)')
    .eq('id', orderId)
    .maybeSingle();
  return { admin, order: (data as OrderRow | null) ?? null };
}

/** Frees the slot place an order was holding (cancelled before it went out). */
async function releaseSlot(admin: NonNullable<ReturnType<typeof adminClient>>, slotId: string | null) {
  if (!slotId) return;
  // Compare-and-set so two cancellations at once can't both decrement from the same value.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data } = await admin.from('slots').select('booked').eq('id', slotId).maybeSingle();
    if (!data || data.booked <= 0) return;
    const { data: done } = await admin
      .from('slots')
      .update({ booked: data.booked - 1 })
      .eq('id', slotId)
      .eq('booked', data.booked)
      .select('id');
    if (done && done.length) return;
  }
}

function refresh(number: number) {
  revalidatePath('/staff');
  revalidatePath(`/staff/orders/${number}`);
  revalidatePath('/account');
  revalidatePath(`/account/orders/${number}`);
}

/**
 * The picking form: save progress, finish and charge, or cancel. One action
 * with an intent so the form keeps a single source of truth for the picked
 * quantities (whatever is on screen is what gets saved or charged).
 */
export async function pickAction(_: StaffState, form: FormData): Promise<StaffState> {
  const staff = await currentStaff();
  if (!staff) return { error: 'You need to be signed in with a staff account.' };
  const intent = String(form.get('intent') ?? 'save');
  const { admin, order } = await load(String(form.get('order_id') ?? ''));
  if (!admin) return { error: 'The order system isn’t connected.' };
  if (!order) return { error: 'That order couldn’t be found.' };
  if (!['authorised', 'picking'].includes(order.status)) {
    return { error: 'This order has already been charged or closed, so it can’t be changed here.' };
  }

  // Quantities from the form, clamped to what was ordered.
  const picks = order.order_items.map((i) => ({
    id: i.id,
    pricePence: i.price_pence,
    qty: i.qty,
    pickedQty: clampPick(Number(form.get(`picked_${i.id}`) ?? i.qty), i.qty),
  }));

  if (intent === 'cancel') return cancel(admin, order, staff.id, String(form.get('reason') ?? '').trim());

  for (const p of picks) {
    const { error } = await admin
      .from('order_items')
      .update({ picked_qty: p.pickedQty, unavailable: p.pickedQty === 0 })
      .eq('id', p.id)
      .eq('order_id', order.id);
    if (error) return { error: 'Couldn’t save the picked quantities. Please try again.' };
  }
  if (order.status === 'authorised') {
    await admin.from('orders').update({ status: 'picking' }).eq('id', order.id).eq('status', 'authorised');
    await admin.from('order_events').insert({ order_id: order.id, status: 'picking', actor: staff.id, note: 'Picking started' });
  }

  if (intent !== 'finish') {
    refresh(order.number);
    return { notice: 'Progress saved.' };
  }

  const charge = chargeFor(picks, order.delivery_pence ?? 0);
  if (charge.total === 0) {
    return cancel(admin, order, staff.id, 'Nothing could be picked');
  }
  if (charge.total > order.total_pence) {
    return { error: 'The picked total is more than the amount held on the card. Check the quantities.' };
  }

  const pay = stripe();
  if (!pay || !order.stripe_payment_intent_id) return { error: 'Card payments aren’t connected, so this order can’t be charged.' };
  let captured: number;
  try {
    // Same key on a retry, so a double tap or a timeout can never charge twice.
    const pi = await pay.paymentIntents.capture(
      order.stripe_payment_intent_id,
      { amount_to_capture: charge.total },
      { idempotencyKey: `capture-${order.id}-${charge.total}` },
    );
    captured = pi.amount_received;
  } catch (e) {
    // Already captured (e.g. an earlier attempt succeeded but we didn't hear back).
    const pi = await pay.paymentIntents.retrieve(order.stripe_payment_intent_id).catch(() => null);
    if (pi?.status === 'succeeded') {
      captured = pi.amount_received;
    } else {
      const msg = e instanceof Error ? e.message : '';
      return {
        error: /expired|canceled/i.test(msg)
          ? 'The card hold has expired or been cancelled, so this order can’t be charged. Contact the customer.'
          : 'The card couldn’t be charged. Nothing has been taken. Please try again, or check the order in Stripe.',
      };
    }
  }

  const shortfall = picks.some((p) => p.pickedQty < p.qty);
  await admin
    .from('orders')
    .update({ status: 'ready', captured_pence: captured })
    .eq('id', order.id)
    .in('status', ['authorised', 'picking']);
  await admin.from('order_events').insert({
    order_id: order.id,
    status: 'ready',
    actor: staff.id,
    note: `Charged ${gbp(captured)}${shortfall ? ' (some items short)' : ''}${charge.delivery ? `, including ${gbp(charge.delivery)} delivery` : ''}`,
  });
  refresh(order.number);
  return {
    notice: `Charged ${gbp(captured)}. ${order.fulfilment === 'delivery' ? 'Packed and waiting for the van.' : 'Ready to collect.'}`,
  };
}

async function cancel(
  admin: NonNullable<ReturnType<typeof adminClient>>,
  order: OrderRow,
  actor: string,
  reason: string,
): Promise<StaffState> {
  const pay = stripe();
  if (order.stripe_payment_intent_id) {
    if (!pay) return { error: 'Card payments aren’t connected, so the hold can’t be released from here. Cancel it in Stripe.' };
    try {
      await pay.paymentIntents.cancel(order.stripe_payment_intent_id, undefined, {
        idempotencyKey: `cancel-${order.id}`,
      });
    } catch (e) {
      console.error('[staff] cancel failed', order.number, e instanceof Error ? e.message : e);
    }
    // Only record the order as cancelled once Stripe itself says the hold is gone.
    const pi = await pay.paymentIntents.retrieve(order.stripe_payment_intent_id).catch(() => null);
    if (pi?.status !== 'canceled') {
      console.error('[staff] hold not released', order.number, pi?.status);
      return { error: 'Couldn’t release the card hold. Nothing has changed. Please try again, or cancel it in Stripe.' };
    }
  }
  const { data } = await admin
    .from('orders')
    .update({ status: 'cancelled', captured_pence: 0 })
    .eq('id', order.id)
    .in('status', ['authorised', 'picking'])
    .select('id');
  if (data?.length) {
    await releaseSlot(admin, order.slot_id);
    await admin.from('order_events').insert({
      order_id: order.id,
      status: 'cancelled',
      actor,
      note: `Cancelled; card hold released${reason ? `. Reason: ${reason}` : ''}`,
    });
  }
  refresh(order.number);
  return { notice: 'Order cancelled. The hold on the customer’s card has been released and nothing was charged.' };
}

/** After charging: van has left, delivered, or collected. */
export async function advanceAction(_: StaffState, form: FormData): Promise<StaffState> {
  const staff = await currentStaff();
  if (!staff) return { error: 'You need to be signed in with a staff account.' };
  const to = String(form.get('to') ?? '');
  const { admin, order } = await load(String(form.get('order_id') ?? ''));
  if (!admin || !order) return { error: 'That order couldn’t be found.' };

  const allowed: Record<string, string[]> = {
    out_for_delivery: ['ready'],
    completed: order.fulfilment === 'delivery' ? ['out_for_delivery', 'ready'] : ['ready'],
  };
  if (!allowed[to]?.includes(order.status)) return { error: 'That step doesn’t apply to this order right now.' };

  let status = to;
  if (to === 'completed') {
    const { data: items } = await admin.from('order_items').select('qty, picked_qty').eq('order_id', order.id);
    const short = (items ?? []).some((i) => (i.picked_qty ?? i.qty) < i.qty);
    status = short ? 'part_fulfilled' : 'completed';
  }
  await admin.from('orders').update({ status }).eq('id', order.id).eq('status', order.status);
  await admin.from('order_events').insert({
    order_id: order.id,
    status,
    actor: staff.id,
    note:
      to === 'out_for_delivery'
        ? 'Out for delivery'
        : order.fulfilment === 'delivery'
          ? 'Delivered'
          : 'Collected',
  });
  refresh(order.number);
  return { notice: 'Updated.' };
}
