import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Phone } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { currentStaff, staffOrder } from '@/lib/staff';
import { slotText, statusLabel } from '@/lib/picking';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Breadcrumbs } from '@/components/shop/breadcrumbs';
import { PickForm } from '@/components/staff/pick-form';
import { AdvanceButton } from '@/components/staff/advance-button';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Pick order · Staff', robots: { index: false, follow: false } };

type Props = { params: Promise<{ number: string }> };
const gbp = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);
const when = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' });

export default async function StaffOrderPage({ params }: Props) {
  const { number } = await params;
  if (!(await currentUser())) redirect(`/account/sign-in?next=/staff/orders/${number}`);
  if (!(await currentStaff())) notFound();
  const o = await staffOrder(Number(number));
  if (!o) notFound();

  const pickable = o.status === 'authorised' || o.status === 'picking';
  const a = o.address;

  return (
    <Container width="narrow" className="py-8 md:py-10">
      <div className="print:hidden">
        <Breadcrumbs items={[{ href: '/staff', label: 'Orders' }, { label: `#${o.number}` }]} />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Heading level={1} size="lg">Order #{o.number}</Heading>
        <span className="rounded-full bg-teal-soft px-3 py-1 font-semibold">{statusLabel(o.status, o.fulfilment)}</span>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-3 rounded-md border border-line p-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-ink-muted">Customer</dt>
          <dd className="font-semibold">{o.customer.name ?? '—'}</dd>
          {o.customer.phone && (
            <dd>
              <a href={`tel:${o.customer.phone.replace(/\s/g, '')}`} className="inline-flex min-h-8 items-center gap-1.5 underline">
                <Phone aria-hidden="true" className="size-4" />
                {o.customer.phone}
              </a>
            </dd>
          )}
          {o.customer.email && <dd className="break-all text-sm">{o.customer.email}</dd>}
        </div>
        <div>
          <dt className="text-sm text-ink-muted">{o.fulfilment === 'delivery' ? 'Delivery' : 'Click & collect'}</dt>
          <dd className="font-semibold">{slotText(o)}</dd>
          {o.fulfilment === 'delivery' && a && (
            <dd>
              {[a.line1, a.line2, a.town, a.postcode].filter(Boolean).join(', ')}
            </dd>
          )}
        </div>
      </dl>

      {pickable ? (
        <PickForm
          orderId={o.id}
          lines={o.items.map((i) => ({ id: i.id, name: i.name, pricePence: i.pricePence, qty: i.qty, pickedQty: i.pickedQty }))}
          deliveryPence={o.deliveryPence}
          heldPence={o.totalPence}
          fulfilment={o.fulfilment}
        />
      ) : (
        <>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {o.items.map((i) => {
              const got = i.pickedQty ?? i.qty;
              return (
                <li key={i.id} className="flex justify-between gap-4 py-3">
                  <span>
                    <span className="tabular-nums">{got} of {i.qty}</span> × {i.name}
                    {got < i.qty && <strong className="ml-2 text-brand">{got === 0 ? 'Unavailable' : `Short by ${i.qty - got}`}</strong>}
                  </span>
                  <span className="tabular-nums">{gbp(i.pricePence * got)}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 flex justify-between text-lg font-bold">
            <span>{o.status === 'cancelled' ? 'Charged (cancelled)' : 'Charged'}</span>
            <span className="tabular-nums">{gbp(o.capturedPence ?? 0)}</span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            {o.status === 'ready' && o.fulfilment === 'delivery' && (
              <AdvanceButton orderId={o.id} to="out_for_delivery" label="Out for delivery" />
            )}
            {(o.status === 'out_for_delivery' || (o.status === 'ready' && o.fulfilment === 'delivery')) && (
              <AdvanceButton orderId={o.id} to="completed" label="Mark delivered" secondary={o.status === 'ready'} />
            )}
            {o.status === 'ready' && o.fulfilment === 'collection' && (
              <AdvanceButton orderId={o.id} to="completed" label="Mark collected" />
            )}
          </div>
        </>
      )}

      {o.events.length > 0 && (
        <section className="mt-10 print:hidden" aria-labelledby="h-history">
          <h2 id="h-history" className="font-semibold">History</h2>
          <ol className="mt-2 space-y-1 text-sm text-ink-muted">
            {o.events.map((e, n) => (
              <li key={n}>
                <span className="tabular-nums">{when.format(new Date(e.createdAt))}</span> · {e.note ?? e.status}
              </li>
            ))}
          </ol>
        </section>
      )}
    </Container>
  );
}
