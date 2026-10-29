import 'server-only';
import type { User } from '@supabase/supabase-js';
import { serverClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';

/**
 * Staff are the accounts listed in public.staff. Checked against Supabase on
 * every request (is_staff() runs as the signed-in user), never trusted from
 * the browser. Returns null for customers and signed-out visitors alike.
 */
export async function currentStaff(): Promise<User | null> {
  const supabase = await serverClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: ok } = await supabase.rpc('is_staff');
  return ok === true ? data.user : null;
}

export type StaffOrderItem = {
  id: string;
  slug: string;
  name: string;
  pricePence: number;
  qty: number;
  pickedQty: number | null;
  unavailable: boolean;
};

export type StaffOrder = {
  id: string;
  number: number;
  status: string;
  fulfilment: 'delivery' | 'collection';
  subtotalPence: number;
  deliveryPence: number;
  totalPence: number;
  capturedPence: number | null;
  paymentIntent: string | null;
  slotId: string | null;
  slot: { startsAt: string; endsAt: string } | null;
  address: { line1?: string; line2?: string; town?: string; postcode?: string } | null;
  createdAt: string;
  customer: { name: string | null; phone: string | null; email: string | null };
  items: StaffOrderItem[];
  events: { status: string; note: string | null; createdAt: string }[];
};

const ORDER_COLUMNS =
  'id, number, status, fulfilment, subtotal_pence, delivery_pence, total_pence, captured_pence, stripe_payment_intent_id, slot_id, address, created_at, user_id, slots(starts_at, ends_at), order_items(id, slug, name, price_pence, qty, picked_qty, unavailable)';

type Row = {
  id: string;
  number: number;
  status: string;
  fulfilment: 'delivery' | 'collection';
  subtotal_pence: number;
  delivery_pence: number | null;
  total_pence: number;
  captured_pence: number | null;
  stripe_payment_intent_id: string | null;
  slot_id: string | null;
  address: StaffOrder['address'];
  created_at: string;
  user_id: string;
  slots: { starts_at: string; ends_at: string } | { starts_at: string; ends_at: string }[] | null;
  order_items: { id: string; slug: string; name: string; price_pence: number; qty: number; picked_qty: number | null; unavailable: boolean }[] | null;
};

function shape(r: Row, customer: StaffOrder['customer'], events: StaffOrder['events'] = []): StaffOrder {
  const slot = Array.isArray(r.slots) ? r.slots[0] : r.slots;
  return {
    id: r.id,
    number: r.number,
    status: r.status,
    fulfilment: r.fulfilment,
    subtotalPence: r.subtotal_pence,
    deliveryPence: r.delivery_pence ?? 0,
    totalPence: r.total_pence,
    capturedPence: r.captured_pence,
    paymentIntent: r.stripe_payment_intent_id,
    slotId: r.slot_id,
    slot: slot ? { startsAt: slot.starts_at, endsAt: slot.ends_at } : null,
    address: r.address,
    createdAt: r.created_at,
    customer,
    items: (r.order_items ?? [])
      .map((i) => ({
        id: i.id,
        slug: i.slug,
        name: i.name,
        pricePence: i.price_pence,
        qty: i.qty,
        pickedQty: i.picked_qty,
        unavailable: i.unavailable,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    events,
  };
}

/** Names and phone numbers for a set of customers, in one query. */
async function customers(userIds: string[]) {
  const admin = adminClient();
  const map = new Map<string, StaffOrder['customer']>();
  if (!admin || userIds.length === 0) return map;
  const { data } = await admin.from('profiles').select('id, full_name, phone').in('id', userIds);
  for (const p of data ?? []) map.set(p.id, { name: p.full_name, phone: p.phone, email: null });
  return map;
}

const ACTIVE = ['authorised', 'picking', 'ready', 'out_for_delivery'];

/**
 * Orders the shop needs to act on, plus the last week's finished ones.
 * Callers must have checked currentStaff() first: this reads with the
 * service-role client so it can join customer details.
 */
export async function staffOrders(): Promise<{ active: StaffOrder[]; recent: StaffOrder[] }> {
  const admin = adminClient();
  if (!admin) return { active: [], recent: [] };
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const [{ data: active }, { data: recent }] = await Promise.all([
    admin.from('orders').select(ORDER_COLUMNS).in('status', ACTIVE).limit(200),
    admin
      .from('orders')
      .select(ORDER_COLUMNS)
      .in('status', ['completed', 'part_fulfilled', 'cancelled'])
      .gte('updated_at', weekAgo)
      .order('updated_at', { ascending: false })
      .limit(50),
  ]);
  const rows = [...((active ?? []) as Row[]), ...((recent ?? []) as Row[])];
  const people = await customers([...new Set(rows.map((r) => r.user_id))]);
  const blank = { name: null, phone: null, email: null };
  const bySlot = (a: StaffOrder, b: StaffOrder) =>
    (a.slot?.startsAt ?? a.createdAt).localeCompare(b.slot?.startsAt ?? b.createdAt);
  return {
    active: ((active ?? []) as Row[]).map((r) => shape(r, people.get(r.user_id) ?? blank)).sort(bySlot),
    recent: ((recent ?? []) as Row[]).map((r) => shape(r, people.get(r.user_id) ?? blank)),
  };
}

/** One order with everything the picker needs. Callers must have checked currentStaff(). */
export async function staffOrder(number: number): Promise<StaffOrder | null> {
  const admin = adminClient();
  if (!admin || !Number.isSafeInteger(number)) return null;
  const { data } = await admin.from('orders').select(ORDER_COLUMNS).eq('number', number).maybeSingle();
  if (!data) return null;
  const r = data as Row;
  const [people, user, { data: events }] = await Promise.all([
    customers([r.user_id]),
    admin.auth.admin.getUserById(r.user_id),
    admin.from('order_events').select('status, note, created_at').eq('order_id', r.id).order('created_at'),
  ]);
  const c = people.get(r.user_id) ?? { name: null, phone: null, email: null };
  return shape(
    r,
    { ...c, email: user.data.user?.email ?? null },
    (events ?? []).map((e) => ({ status: e.status, note: e.note, createdAt: e.created_at })),
  );
}
