import 'server-only';
import { serverClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';

export type OrderSummary = {
  id: string;
  number: number;
  status: string;
  fulfilment: 'delivery' | 'collection';
  totalPence: number;
  deliveryPence: number;
  /** Set once the shop has picked and charged the order. */
  capturedPence: number | null;
  createdAt: string;
  items: { slug: string; name: string; qty: number; pickedQty: number | null; pricePence: number; unavailable: boolean }[];
};

export const STATUS_LABEL: Record<string, string> = {
  awaiting_payment: 'Awaiting payment',
  authorised: 'Order placed',
  picking: 'Being picked',
  ready: 'Ready to collect',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  part_fulfilled: 'Completed (some items unavailable)',
  cancelled: 'Cancelled',
};

/** The customer's orders, newest first. RLS limits this to their own. */
export async function myOrders(): Promise<OrderSummary[]> {
  const supabase = await serverClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('orders')
    .select('id, number, status, fulfilment, total_pence, delivery_pence, captured_pence, created_at, order_items(slug, name, qty, picked_qty, price_pence, unavailable)')
    .neq('status', 'awaiting_payment')
    .order('created_at', { ascending: false })
    .limit(50);
  return (data ?? []).map((o) => ({
    id: o.id,
    number: o.number,
    status: o.status,
    fulfilment: o.fulfilment,
    totalPence: o.total_pence,
    deliveryPence: o.delivery_pence ?? 0,
    capturedPence: o.captured_pence ?? null,
    createdAt: o.created_at,
    items: (o.order_items ?? []).map((i: { slug: string; name: string; qty: number; picked_qty: number | null; price_pence: number; unavailable: boolean }) => ({
      slug: i.slug,
      name: i.name,
      qty: i.qty,
      pickedQty: i.picked_qty,
      pricePence: i.price_pence,
      unavailable: i.unavailable,
    })),
  }));
}

/**
 * Buy again: products from the customer's placed orders, most often bought
 * first, then most recent. (The database view counts completed orders only;
 * this includes orders still on their way, which is what shoppers expect.)
 */
export function buyAgainSlugs(orders: OrderSummary[]): string[] {
  const score = new Map<string, { n: number; last: string }>();
  for (const o of orders) {
    if (o.status === 'cancelled') continue;
    for (const i of o.items) {
      if (i.unavailable) continue;
      const s = score.get(i.slug) ?? { n: 0, last: '' };
      score.set(i.slug, { n: s.n + 1, last: s.last > o.createdAt ? s.last : o.createdAt });
    }
  }
  return [...score.entries()].sort((a, b) => b[1].n - a[1].n || b[1].last.localeCompare(a[1].last)).map(([slug]) => slug);
}

export async function myFavouriteSlugs(): Promise<string[]> {
  const supabase = await serverClient();
  const admin = adminClient();
  if (!supabase || !admin) return [];
  const { data } = await supabase.from('favourites').select('product_id').order('created_at', { ascending: false });
  if (!data?.length) return [];
  const { data: products } = await admin.from('products').select('id, slug').in('id', data.map((f) => f.product_id));
  const byId = new Map((products ?? []).map((p) => [p.id as string, p.slug as string]));
  return data.map((f) => byId.get(f.product_id)).filter((s): s is string => Boolean(s));
}

export async function myProfile() {
  const supabase = await serverClient();
  if (!supabase) return null;
  const { data } = await supabase.from('profiles').select('full_name, phone, marketing_consent').maybeSingle();
  return data as { full_name: string | null; phone: string | null; marketing_consent: boolean } | null;
}

export type SavedAddress = {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  town: string;
  postcode: string;
  miles: number | null;
  deliveryEligible: boolean | null;
  isDefault: boolean;
};

/** The customer's saved addresses, default first. RLS limits this to their own. */
export async function myAddresses(): Promise<SavedAddress[]> {
  const supabase = await serverClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('addresses')
    .select('id, label, line1, line2, town, postcode, distance_miles, delivery_eligible, is_default, created_at')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });
  return (data ?? []).map((a) => ({
    id: a.id,
    label: a.label,
    line1: a.line1,
    line2: a.line2,
    town: a.town,
    postcode: a.postcode,
    miles: a.distance_miles == null ? null : Number(a.distance_miles),
    deliveryEligible: a.delivery_eligible,
    isDefault: a.is_default,
  }));
}
