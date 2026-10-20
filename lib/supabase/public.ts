import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cookie-free Supabase client for PUBLIC content.
 *
 * Reach for this by default. Because it never touches cookies, pages using it
 * can still be prerendered and revalidated on a schedule. Using the
 * cookie-aware server client for public marketing content is the easiest way
 * to accidentally opt an entire site into dynamic rendering.
 *
 * Returns null when the environment isn't configured, so callers can fall back
 * to bundled sample content rather than throwing. See lib/content/.
 */
export function publicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      // No session to persist, and nothing to refresh — this client is only
      // ever used for anonymous reads of published content.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
