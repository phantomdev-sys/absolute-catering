import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

// Placeholder until accounts (Supabase) and Stripe test keys are connected.
export default function CheckoutPage() {
  return (
    <Container width="narrow" className="py-section">
      <Heading level={1} size="lg">Checkout</Heading>
      <ol className="mt-6 list-decimal space-y-2 pl-6 text-lg">
        <li>Sign in or create an account</li>
        <li>Delivery or click &amp; collect, and your address</li>
        <li>Choose a slot</li>
        <li>Pay securely with Stripe</li>
      </ol>
      <p className="mt-6 text-ink-muted">Checkout is being connected. Your basket is saved on this device.</p>
      <div className="mt-8"><Button href="/basket" variant="secondary">Back to basket</Button></div>
    </Container>
  );
}
