import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronRight, Store, Truck } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { currentStaff, staffOrders, type StaffOrder } from '@/lib/staff';
import { slotText, statusLabel } from '@/lib/picking';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Orders · Staff', robots: { index: false, follow: false } };

const gbp = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);
const GROUPS: { status: string; title: string; hint: string }[] = [
  { status: 'authorised', title: 'To pick', hint: 'Card held. Nothing charged yet.' },
  { status: 'picking', title: 'Being picked', hint: 'Started but not charged yet.' },
  { status: 'ready', title: 'Charged and packed', hint: 'Waiting for the van or the customer.' },
  { status: 'out_for_delivery', title: 'Out for delivery', hint: 'Mark delivered when the van’s back.' },
];

export default async function StaffOrdersPage() {
  if (!(await currentUser())) redirect('/account/sign-in?next=/staff');
  // Signed in but not staff: behave as if the page doesn't exist.
  if (!(await currentStaff())) notFound();
  const { active, recent } = await staffOrders();

  return (
    <Container width="wide" className="py-8 md:py-10">
      <Heading level={1} size="lg">Orders</Heading>
      <p className="mt-2 text-ink-muted">Sorted by slot, earliest first. Open an order to pick it and charge the card.</p>

      {active.length === 0 && (
        <p className="mt-8 rounded-md border border-line bg-ground-subtle p-5">No orders waiting. New orders appear here as soon as the customer pays.</p>
      )}

      {GROUPS.map((g) => {
        const orders = active.filter((o) => o.status === g.status);
        if (orders.length === 0) return null;
        return (
          <section key={g.status} className="mt-10" aria-labelledby={`h-${g.status}`}>
            <h2 id={`h-${g.status}`} className="text-xl font-semibold">
              {g.title} <span className="font-normal text-ink-muted">({orders.length})</span>
            </h2>
            <p className="text-sm text-ink-muted">{g.hint}</p>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {orders.map((o) => (
                <OrderRow key={o.id} o={o} />
              ))}
            </ul>
          </section>
        );
      })}

      {recent.length > 0 && (
        <section className="mt-12" aria-labelledby="h-recent">
          <h2 id="h-recent" className="text-xl font-semibold">Finished in the last 7 days</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {recent.map((o) => (
              <OrderRow key={o.id} o={o} />
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}

function OrderRow({ o }: { o: StaffOrder }) {
  const items = o.items.reduce((n, i) => n + i.qty, 0);
  const Icon = o.fulfilment === 'delivery' ? Truck : Store;
  return (
    <li>
      <Link href={`/staff/orders/${o.number}`} className="flex min-h-16 items-center gap-3 py-3 hover:bg-ground-subtle sm:gap-4">
        <Icon aria-hidden="true" className="size-5 shrink-0 text-brand" />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">
            #{o.number} · {o.customer.name ?? 'Customer'}
          </span>
          <span className="block text-sm text-ink-muted">
            {o.fulfilment === 'delivery' ? `Delivery${o.address?.postcode ? ` to ${o.address.postcode}` : ''}` : 'Collection'} · {slotText(o)} · {items} item{items === 1 ? '' : 's'}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block tabular-nums font-semibold">{gbp(o.capturedPence ?? o.totalPence)}</span>
          <span className="block text-xs text-ink-muted">{o.capturedPence != null ? 'charged' : 'held'} · {statusLabel(o.status, o.fulfilment)}</span>
        </span>
        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-ink-muted" />
      </Link>
    </li>
  );
}
