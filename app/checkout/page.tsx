import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { getProducts } from '@/lib/catalogue';
import { bookableSlots } from '@/lib/slots';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import type { BasketProduct } from '@/components/basket/basket-view';

// Per-customer and session-dependent: never prerender or cache.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

// Accounts are required to check out (decision, 20 Oct 2026).
export default async function CheckoutPage() {
  const user = await currentUser();
  if (!user) redirect('/account/sign-in?next=/checkout');

  const [products, { slots, demo }] = await Promise.all([getProducts(), bookableSlots()]);
  const catalogue: Record<string, BasketProduct> = {};
  for (const p of products) {
    if (p.status === 'live' && p.pricePence != null) {
      catalogue[p.slug] = { slug: p.slug, name: p.name, pricePence: p.pricePence, ownBrand: p.ownBrand };
    }
  }

  return (
    <Container width="wide" className="py-8 md:py-10">
      <Heading level={1} size="lg">Checkout</Heading>
      <p className="mt-2 text-ink-muted">Signed in as {user.email}</p>
      <CheckoutForm catalogue={catalogue} slots={slots} demoSlots={demo} />
    </Container>
  );
}
