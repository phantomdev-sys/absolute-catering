/**
 * Demo mode: every product priced at £1.00 so the basket and Stripe test
 * checkout can be shown before the client's prices arrive.
 *
 * Off unless NEXT_PUBLIC_DEMO_PRICES is exactly "1". Set it only on the Vercel
 * Preview environment. The site shows a banner whenever it's on, and the
 * launch checklist requires it to be absent in Production (register #41).
 */
export const DEMO_PRICES = process.env.NEXT_PUBLIC_DEMO_PRICES === '1';
export const DEMO_PRICE_PENCE = 100;
