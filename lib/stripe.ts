import 'server-only';
import Stripe from 'stripe';

/** Null when the key isn't set, so pages can explain rather than crash. */
export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // Refuse a live key while the demo is running: test mode only until launch.
  if (process.env.NEXT_PUBLIC_DEMO_PRICES === '1' && key.startsWith('sk_live_')) {
    throw new Error('Live Stripe key with demo prices switched on. Use a test key.');
  }
  return new Stripe(key);
}
