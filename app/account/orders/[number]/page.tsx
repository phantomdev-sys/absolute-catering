import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { myOrders, STATUS_LABEL } from '@/lib/account';
import { getProducts } from '@/lib/catalogue';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Breadcrumbs } from '@/components/shop/breadcrumbs';
import { BuyAgainAll } from '@/components/account/buy-again-all';

// Per-customer and session-dependent: never prerender or cache.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Order', robots: { index: false } };

type Props = { params: Promise<{ number: string }> };
const gbp = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);

export default async function OrderPage({ params }: Props) {
  const user = await currentUser();
  const { number } = await params;
  if (!user) redirect(`/account/sign-in?next=/account/orders/${number}`);
  // Looked up within the customer's own orders, so a guessed number shows nothing.
  const order = (await myOrders()).find((o) => String(o.number) === number);
  if (!order) notFound();
  const live = new Set((await getProducts()).filter((p) => p.status === 'live').map((p) => p.slug));

  return (
    <Container width="narrow" className="py-8 md:py-10">
      <Breadcrumbs items={[{ href: '/account', label: 'Account' }, { label: `Order ${order.number}` }]} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Heading level={1} size="lg">Order {order.number}</Heading>
        <span className="rounded-full bg-teal-soft px-3 py-1 font-semibold">{STATUS_LABEL[order.status] ?? order.status}</span>
      </div>
      <p className="mt-2 text-ink-muted">{order.fulfilment === 'delivery' ? 'Delivery' : 'Click & collect'}</p>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {order.items.map((i) => (
          <li key={i.slug} className="flex justify-between gap-4 py-3">
            <span>
              {i.qty} × <Link href={`/product/${i.slug}`} className="hover:underline">{i.name}</Link>
              {i.unavailable && <span className="ml-2 text-sm text-ink-muted">(unavailable, not charged)</span>}
            </span>
            <span className="tabular-nums">{gbp(i.pricePence * i.qty)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex justify-between text-lg font-bold"><span>Held on your card</span><span className="tabular-nums">{gbp(order.totalPence)}</span></p>
      <p className="mt-1 text-sm text-ink-muted">You’re charged only for what we pick. <Link href="/payments" className="underline">How payment works</Link></p>
      <div className="mt-8">
        <BuyAgainAll items={order.items.filter((i) => !i.unavailable && live.has(i.slug)).map((i) => ({ slug: i.slug, qty: i.qty }))} />
      </div>
    </Container>
  );
}
