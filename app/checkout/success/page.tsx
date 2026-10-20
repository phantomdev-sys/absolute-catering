import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CircleCheck } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { confirmFromSession } from '@/lib/orders';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { ClearBasket } from '@/components/basket/clear-basket';

// Per-customer and session-dependent: never prerender or cache.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Order confirmed', robots: { index: false } };

type Props = { searchParams: Promise<{ session_id?: string }> };

const gbp = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);

export default async function SuccessPage({ searchParams }: Props) {
  const user = await currentUser();
  if (!user) redirect('/account/sign-in?next=/account');
  const sessionId = (await searchParams).session_id;
  const result = sessionId ? await confirmFromSession(sessionId, user.id) : { ok: false as const, reason: 'unknown' };

  if (!result.ok) {
    return (
      <Container width="narrow" className="py-section">
        <Heading level={1} size="lg">We couldn’t confirm that payment</Heading>
        <p className="mt-4 text-lg text-ink-muted">
          Nothing has been taken. Your basket is still saved, so you can try again, or call us on 028 8224 8104.
        </p>
        <div className="mt-8"><Button href="/basket">Back to basket</Button></div>
      </Container>
    );
  }

  return (
    <Container width="narrow" className="py-section">
      <ClearBasket />
      <CircleCheck aria-hidden="true" className="size-12 text-accent" />
      <Heading level={1} size="lg" className="mt-4">Thank you. Order {result.number} is in.</Heading>
      <p className="mt-4 text-lg">
        We’ve held {gbp(result.total)} on your card. We’ll pick your order by hand and charge only for what we can
        supply. Anything out of stock is simply left off.
      </p>
      <p className="mt-3 text-ink-muted">
        {result.fulfilment === 'delivery' ? 'It’ll come out in our refrigerated van in your chosen slot.' : 'It’ll be packed and waiting at the store at your chosen time.'}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href={`/account/orders/${result.number}`}>View your order</Button>
        <Button href="/shop" variant="secondary">Keep shopping</Button>
      </div>
    </Container>
  );
}
