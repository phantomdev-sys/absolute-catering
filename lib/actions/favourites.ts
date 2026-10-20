'use server';

import { serverClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';

/**
 * Favourites are keyed by slug in the browser and by product id in the
 * database. Products awaiting data are hidden from customers by RLS, so the
 * slug → id lookup uses the service role; the favourite itself is written
 * with the customer's own session, so RLS still guarantees it's theirs.
 */

export async function listFavourites(): Promise<{ signedIn: boolean; slugs: string[] }> {
  const supabase = await serverClient();
  if (!supabase) return { signedIn: false, slugs: [] };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { signedIn: false, slugs: [] };
  const admin = adminClient();
  const { data } = await supabase.from('favourites').select('product_id');
  if (!admin || !data?.length) return { signedIn: true, slugs: [] };
  const { data: products } = await admin
    .from('products')
    .select('slug')
    .in('id', data.map((f) => f.product_id));
  return { signedIn: true, slugs: (products ?? []).map((p) => p.slug as string) };
}

export async function toggleFavourite(slug: string): Promise<'added' | 'removed' | 'signin' | 'error'> {
  const supabase = await serverClient();
  const admin = adminClient();
  if (!supabase || !admin) return 'error';
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return 'signin';
  const { data: product } = await admin.from('products').select('id').eq('slug', slug).maybeSingle();
  if (!product) return 'error';

  const { data: existing } = await supabase
    .from('favourites')
    .select('product_id')
    .eq('product_id', product.id)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase.from('favourites').delete().eq('product_id', product.id);
    return error ? 'error' : 'removed';
  }
  const { error } = await supabase.from('favourites').insert({ user_id: auth.user.id, product_id: product.id });
  return error ? 'error' : 'added';
}
