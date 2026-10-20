import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Keeps the Supabase session fresh on the pages that use it. Scoped by the
 * matcher to account, checkout and auth routes only, so the shop's product
 * and aisle pages stay static and never wait on this.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });
  // Refreshes the token if it has expired; the result itself isn't needed here.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/auth/:path*', '/favourites/:path*'],
};
