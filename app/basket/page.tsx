import type { Metadata } from 'next';
import { ShoppingBasket } from 'lucide-react';
import { site } from '@/content/site';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';

export const metadata: Metadata = { title: 'Basket', robots: { index: false } };

// Placeholder until Phase 3 (basket, slots, Stripe). Honest about it.
export default function BasketPage() {
  return (
    <Container width="narrow" className="py-section text-center">
      <ShoppingBasket aria-hidden="true" className="mx-auto size-12 text-brand" strokeWidth={1.5} />
      <Heading level={1} size="lg" className="mt-4">
        Your basket
      </Heading>
      <p className="mt-3 text-lg text-ink-muted">{site.preLaunchNotice}</p>
      <div className="mt-8 flex justify-center">
        <Button href="/shop">Browse the aisles</Button>
      </div>
    </Container>
  );
}
