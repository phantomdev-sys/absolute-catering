import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { getProducts } from '@/lib/catalogue';
import { myOrders, buyAgainSlugs, myFavouriteSlugs, myProfile, myAddresses } from '@/lib/account';
import { statusLabel } from '@/lib/picking';
import { currentStaff } from '@/lib/staff';
import { signOut, setMarketing, deleteAddress, makeDefaultAddress } from './actions';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { ProductGrid } from '@/components/shop/product-grid';
import { BuyAgainAll } from '@/components/account/buy-again-all';
import { DetailsForm, AddAddressForm } from '@/components/account/details-forms';

// Per-customer and session-dependent: never prerender or cache.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Your account', robots: { index: false } };

const gbp = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);
const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Europe/London', day: 'numeric', month: 'short', year: 'numeric' });

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect('/account/sign-in?next=/account');

  const [products, orders, favourites, profile, addresses, staff] = await Promise.all([
    getProducts(),
    myOrders(),
    myFavouriteSlugs(),
    myProfile(),
    myAddresses(),
    currentStaff(),
  ]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const again = buyAgainSlugs(orders).flatMap((s) => (bySlug.get(s) ? [bySlug.get(s)!] : [])).slice(0, 10);
  const favs = favourites.flatMap((s) => (bySlug.get(s) ? [bySlug.get(s)!] : []));
  const first = profile?.full_name?.split(' ')[0];

  return (
    <Container width="wide" className="py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading level={1} size="lg">{first ? `Hello, ${first}` : 'Your account'}</Heading>
          <p className="mt-1 text-ink-muted">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {staff && (
            <Link href="/staff" className="inline-flex min-h-11 items-center rounded-md bg-accent px-4 font-semibold text-accent-ink hover:bg-accent-hover">
              Shop orders
            </Link>
          )}
          <form action={signOut}>
            <button type="submit" className="min-h-11 rounded-md border border-line-strong px-4 font-semibold hover:border-ink">Sign out</button>
          </form>
        </div>
      </div>

      <section aria-labelledby="again-heading" className="mt-12">
        <Heading level={2} size="md" id="again-heading">Buy again</Heading>
        {again.length > 0 ? (
          <div className="mt-6"><ProductGrid products={again} /></div>
        ) : (
          <p className="mt-3 text-ink-muted">Things you order will appear here, ready to add again in one tap.</p>
        )}
      </section>

      <section aria-labelledby="orders-heading" className="mt-12">
        <Heading level={2} size="md" id="orders-heading">Your orders</Heading>
        {orders.length > 0 ? (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <Link href={`/account/orders/${o.number}`} className="font-semibold text-accent underline underline-offset-4">Order {o.number}</Link>
                  <p className="text-sm text-ink-muted">
                    {date(o.createdAt)} · {o.fulfilment === 'delivery' ? 'Delivery' : 'Click & collect'} · {o.items.reduce((n, i) => n + i.qty, 0)} items · {gbp(o.totalPence)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-teal-soft px-3 py-1 text-sm font-semibold">{statusLabel(o.status, o.fulfilment)}</span>
                  <BuyAgainAll items={o.items.filter((i) => !i.unavailable && bySlug.get(i.slug)?.status === 'live').map((i) => ({ slug: i.slug, qty: i.qty }))} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-ink-muted">No orders yet. <Link href="/shop" className="font-semibold text-accent underline">Start shopping</Link></p>
        )}
      </section>

      <section aria-labelledby="fav-heading" className="mt-12">
        <Heading level={2} size="md" id="fav-heading">Favourites</Heading>
        {favs.length > 0 ? (
          <div className="mt-6"><ProductGrid products={favs} /></div>
        ) : (
          <p className="mt-3 text-ink-muted">Tap the heart on any product to save it here.</p>
        )}
      </section>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
        <section aria-labelledby="details-heading" className="rounded-md border border-line p-6">
          <Heading level={2} size="sm" id="details-heading">Your details</Heading>
          <DetailsForm fullName={profile?.full_name ?? ''} phone={profile?.phone ?? ''} email={user.email ?? ''} />
        </section>

        <section aria-labelledby="addresses-heading" className="rounded-md border border-line p-6">
          <Heading level={2} size="sm" id="addresses-heading">Delivery addresses</Heading>
          {addresses.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {addresses.map((a) => (
                <li key={a.id} className="rounded-md border border-line bg-ground-subtle p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {a.label || a.line1}
                        {a.isDefault && <span className="ml-2 rounded-full bg-teal-soft px-2 py-0.5 text-xs font-semibold">Default</span>}
                      </p>
                      <p className="text-sm text-ink-muted">
                        {[a.label ? a.line1 : null, a.line2, a.town, a.postcode].filter(Boolean).join(', ')}
                      </p>
                      <p className="mt-1 text-sm">
                        {a.deliveryEligible
                          ? `We deliver here${a.miles != null ? ` (about ${Math.round(a.miles)} miles)` : ''}`
                          : 'Outside our delivery area: click & collect'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!a.isDefault && (
                        <form action={makeDefaultAddress}>
                          <input type="hidden" name="id" value={a.id} />
                          <button type="submit" className="min-h-11 px-2 text-sm font-semibold text-accent underline underline-offset-4">Make default</button>
                        </form>
                      )}
                      <form action={deleteAddress}>
                        <input type="hidden" name="id" value={a.id} />
                        <button type="submit" className="min-h-11 px-2 text-sm font-semibold text-ink-muted underline underline-offset-4">
                          Remove<span className="sr-only"> {a.label || a.line1}</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-ink-muted">Save an address and checkout fills it in for you.</p>
          )}
          <details className="mt-5" open={addresses.length === 0}>
            <summary className="min-h-11 cursor-pointer font-semibold text-accent">Add an address</summary>
            <AddAddressForm />
          </details>
        </section>
      </div>

      <section aria-labelledby="prefs-heading" className="mt-8 max-w-xl rounded-md border border-line p-6">
        <Heading level={2} size="sm" id="prefs-heading">Email preferences</Heading>
        <form action={setMarketing} className="mt-4 space-y-4">
          <label className="flex items-start gap-3">
            <input type="checkbox" name="marketing" defaultChecked={profile?.marketing_consent ?? false} className="mt-0.5 size-5 accent-accent" />
            <span>Send me offers and news by email. Order updates are always sent.</span>
          </label>
          <button type="submit" className="min-h-11 rounded-md bg-accent px-5 font-semibold text-accent-ink hover:bg-accent-hover">Save preferences</button>
        </form>
      </section>
    </Container>
  );
}
