import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Cookie-aware Supabase client, for anything involving a USER SESSION.
 *
 * Reading cookies opts the calling page into dynamic rendering. That is the
 * right trade for authenticated or personalised content and the wrong one for
 * public content — use publicClient() from ./public for that.
 *
 * Returns null when the environment isn't configured, so callers can fall back
 * to sample content rather than throwing during a build with no secrets.
 */
export async function serverClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. When the session is being
          // refreshed by middleware this is expected and harmless; without
          // middleware, a stale session simply isn't refreshed here.
        }
      },
    },
  });
}
