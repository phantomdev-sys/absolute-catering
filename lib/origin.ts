import 'server-only';
import { headers } from 'next/headers';

/**
 * The site's own origin for links sent elsewhere (Stripe return URLs, email
 * confirmations). Taken from the request so previews and production each send
 * customers back to themselves; NEXT_PUBLIC_SITE_URL wins when it's set.
 */
export async function siteOrigin(): Promise<string> {
  const fixed = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fixed && !fixed.includes('localhost')) return fixed.replace(/\/$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}
