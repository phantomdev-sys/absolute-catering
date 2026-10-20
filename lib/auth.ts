import 'server-only';
import type { User } from '@supabase/supabase-js';
import { serverClient } from '@/lib/supabase/server';

/** The signed-in customer, verified with Supabase (not just read from the cookie). */
export async function currentUser(): Promise<User | null> {
  const supabase = await serverClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
