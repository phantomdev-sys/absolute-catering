import 'server-only';
import { adminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';

/**
 * Confirms an order once Stripe says the card is authorised. Safe to call more
 * than once (the success page and, later, the webhook may both do it): it only
 * acts on an order still awaiting payment.
 */
export async function confirmFromSession(sessionId: string, userId: string) {
  const admin = adminClient();
  const pay = stripe();
  if (!admin || !pay) return { ok: false as const, reason: 'not-configured' };

  const session = await pay.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent'] });
  const orderId = session.metadata?.order_id;
  if (!orderId) return { ok: false as const, reason: 'unknown' };

  const { data: order } = await admin
    .from('orders')
    .select('id, number, user_id, status, slot_id, total_pence, fulfilment')
    .eq('id', orderId)
    .maybeSingle();
  // Only the customer who placed it can confirm (and see) it.
  if (!order || order.user_id !== userId) return { ok: false as const, reason: 'unknown' };

  const pi = typeof session.payment_intent === 'object' ? session.payment_intent : null;
  if (order.status === 'awaiting_payment' && pi?.status === 'requires_capture') {
    const booked = order.slot_id
      ? (await admin.rpc('confirm_slot_booking', { p_slot: order.slot_id, p_user: userId })).data
      : true;
    await admin
      .from('orders')
      .update({ status: 'authorised', stripe_payment_intent_id: pi.id })
      .eq('id', order.id)
      .eq('status', 'awaiting_payment');
    await admin.from('order_events').insert({
      order_id: order.id,
      status: 'authorised',
      note: booked ? 'Card authorised; slot booked' : 'Card authorised; SLOT FULL, staff to rebook',
    });
    return { ok: true as const, number: order.number, total: order.total_pence, fulfilment: order.fulfilment };
  }
  if (order.status !== 'awaiting_payment') {
    return { ok: true as const, number: order.number, total: order.total_pence, fulfilment: order.fulfilment };
  }
  return { ok: false as const, reason: 'unpaid' };
}
