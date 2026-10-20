import { DEMO_PRICES } from '@/lib/demo';

/** Unmissable while demo prices are on, so nobody mistakes £1.00 for real. */
export function DemoBanner() {
  if (!DEMO_PRICES) return null;
  return (
    <div role="note" className="border-b-2 border-notice-line bg-notice px-4 py-2 text-center text-sm font-semibold text-ink">
      Demo shop: every price is a £1.00 placeholder and payments run in Stripe test mode. Nothing is charged.
    </div>
  );
}
