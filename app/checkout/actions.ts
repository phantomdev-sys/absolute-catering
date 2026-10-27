'use server';

import { serverClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { getProducts } from '@/lib/catalogue';
import { checkPostcode } from '@/lib/delivery';
import { deliveryChargePence, deliveryMinimumPence } from '@/content/delivery';
import { siteOrigin } from '@/lib/origin';
import { stripe } from '@/lib/stripe';

export type CheckoutInput = {
  lines: { slug: string; qty: number }[];
  fulfilment: 'delivery' | 'collection';
  slotId: string;
  address?: { line1: string; line2?: string; town: string; postcode: string };
  phone?: string;
};

export type CheckoutResult = { url: string } | { error: string };

/**
 * Turns a basket into an order and a Stripe Checkout session.
 *
 * Trusts nothing from the browser except which products, how many, and the
 * customer's choices. Prices come from the catalogue, delivery eligibility
 * from postcodes.io, slot availability from the database (hold_slot locks the
 * row). Payment is authorised only (manual capture); staff capture the final
 * amount after picking.
 */
export async function startCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const supabase = await serverClient();
  const admin = adminClient();
  const pay = stripe();
  if (!supabase || !admin || !pay) return { error: 'Checkout isn’t connected yet. Please try again later.' };

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { error: 'Please sign in to check out.' };

  // 1. Price the basket from the catalogue.
  const catalogue = new Map((await getProducts()).map((p) => [p.slug, p]));
  const priced = [];
  for (const l of input.lines) {
    const p = catalogue.get(l.slug);
    const qty = Math.floor(l.qty);
    if (!p || p.status !== 'live' || p.pricePence == null || qty < 1 || qty > 99) continue;
    priced.push({ product: p, qty });
  }
  if (priced.length === 0) return { error: 'Your basket is empty or its items are no longer available.' };
  const subtotal = priced.reduce((n, l) => n + l.product.pricePence! * l.qty, 0);
  const gbp = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);
  if (input.fulfilment === 'delivery' && subtotal < deliveryMinimumPence) {
    return {
      error: `Delivery needs a minimum spend of ${gbp(deliveryMinimumPence)}. Add ${gbp(deliveryMinimumPence - subtotal)} more, or choose click & collect (no minimum).`,
    };
  }
  const deliveryPence = input.fulfilment === 'delivery' ? deliveryChargePence : 0;

  // 2. Delivery address must be inside the radius, checked here, not in the browser.
  let address: Record<string, unknown> | null = null;
  if (input.fulfilment === 'delivery') {
    const a = input.address;
    if (!a?.line1?.trim() || !a.town?.trim() || !a.postcode?.trim()) return { error: 'Please complete your delivery address.' };
    const check = await checkPostcode(a.postcode);
    if (check.kind !== 'ok') return { error: 'We couldn’t check that postcode. Please check it and try again.' };
    if (!check.delivers) {
      return { error: `${check.postcode} is about ${Math.round(check.miles)} miles away, outside our delivery area. Choose click & collect instead.` };
    }
    address = {
      line1: a.line1.trim(),
      line2: a.line2?.trim() || null,
      town: a.town.trim(),
      postcode: check.postcode,
      miles: check.miles,
      phone: input.phone?.trim() || null,
    };
    // First delivery order: keep the address so next time checkout fills it in.
    const { count } = await admin.from('addresses').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
    if ((count ?? 0) === 0) {
      await admin.from('addresses').insert({
        user_id: user.id,
        line1: a.line1.trim(),
        line2: a.line2?.trim() || null,
        town: a.town.trim(),
        postcode: check.postcode,
        lat: check.lat,
        lng: check.lng,
        distance_miles: check.miles,
        delivery_eligible: true,
        is_default: true,
      });
    }
  }

  // 3. Slot: must match the fulfilment type; the hold is taken as the customer.
  const { data: slot } = await admin.from('slots').select('id, type').eq('id', input.slotId).maybeSingle();
  if (!slot || slot.type !== input.fulfilment) return { error: 'Please choose a slot.' };
  const { error: holdError } = await supabase.rpc('hold_slot', { p_slot: slot.id });
  if (holdError) {
    return { error: /full/.test(holdError.message) ? 'Sorry, that slot has just filled up. Please pick another.' : 'That slot is no longer available. Please pick another.' };
  }

  // 4. Order and its lines (product ids via the service role; see favourites).
  const { data: ids } = await admin.from('products').select('id, slug').in('slug', priced.map((l) => l.product.slug));
  const idBySlug = new Map((ids ?? []).map((r) => [r.slug as string, r.id as string]));
  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: user.id,
      fulfilment: input.fulfilment,
      slot_id: slot.id,
      address,
      subtotal_pence: subtotal,
      delivery_pence: deliveryPence,
      total_pence: subtotal + deliveryPence,
      vat_breakdown: process.env.NEXT_PUBLIC_DEMO_PRICES === '1' ? { demo: true } : {},
    })
    .select('id, number')
    .single();
  if (orderError || !order) return { error: 'We couldn’t create your order. Please try again.' };

  await admin.from('order_items').insert(
    priced.map((l) => ({
      order_id: order.id,
      product_id: idBySlug.get(l.product.slug) ?? null,
      name: l.product.name,
      slug: l.product.slug,
      price_pence: l.product.pricePence!,
      vat_rate: null,
      qty: l.qty,
    })),
  );
  await admin.from('order_events').insert({ order_id: order.id, status: 'awaiting_payment', actor: user.id });

  // 5. Stripe Checkout: authorise only, expire with the slot hold.
  const origin = await siteOrigin();
  const session = await pay.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    client_reference_id: order.id,
    metadata: { order_id: order.id, order_number: String(order.number) },
    payment_intent_data: {
      capture_method: 'manual',
      metadata: { order_id: order.id, order_number: String(order.number) },
      description: `Absolute Catering Supplies order ${order.number}`,
    },
    line_items: [
      ...priced.map((l) => ({
        quantity: l.qty,
        price_data: { currency: 'gbp', unit_amount: l.product.pricePence!, product_data: { name: l.product.name } },
      })),
      ...(deliveryPence > 0
        ? [{ quantity: 1, price_data: { currency: 'gbp', unit_amount: deliveryPence, product_data: { name: 'Delivery' } } }]
        : []),
    ],
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/basket`,
  });
  await admin.from('orders').update({ stripe_checkout_session_id: session.id }).eq('id', order.id);

  if (!session.url) return { error: 'Payment couldn’t be started. Please try again.' };
  return { url: session.url };
}
