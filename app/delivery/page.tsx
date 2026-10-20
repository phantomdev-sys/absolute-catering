import type { Metadata } from 'next';
import { CircleAlert, CircleCheck, Store } from 'lucide-react';
import { deliveryPage as copy } from '@/content/pages';
import { districts, radiusMiles } from '@/content/delivery';
import { site } from '@/content/site';
import { checkPostcode } from '@/lib/delivery';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Breadcrumbs } from '@/components/shop/breadcrumbs';
import { PostcodeForm } from '@/components/delivery/postcode-form';
import { RadiusMap } from '@/components/delivery/radius-map';

export const metadata: Metadata = {
  title: copy.title,
  description: copy.intro,
};

type Props = { searchParams: Promise<{ postcode?: string | string[] }> };

/**
 * The postcode check lands here, from the header bar, the homepage or this
 * page's own form. It's a server-rendered GET, so it works without JavaScript
 * and the result is a link someone can send to a neighbour.
 */
export default async function DeliveryPage({ searchParams }: Props) {
  const raw = (await searchParams).postcode;
  const input = Array.isArray(raw) ? raw[0] : raw;
  const result = await checkPostcode(input);
  const tel = site.contact.phone.replace(/\s/g, '');

  return (
    <Container width="wide" className="py-8 md:py-10">
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: copy.title }]} />

      <div className="mt-6 grid items-start gap-10 lg:grid-cols-2">
        <div>
          <Heading level={1} size="lg">
            {copy.title}
          </Heading>
          <p className="mt-3 text-lg text-ink-muted">{copy.intro}</p>

          <div className="mt-8 rounded-md border border-line bg-ground-subtle p-5">
            <PostcodeForm
              id="page-postcode"
              size="lg"
              label="Check your postcode"
              defaultValue={result.kind === 'ok' || result.kind === 'not-found' ? result.postcode : undefined}
            />
          </div>

          <div aria-live="polite" className="mt-6">
            {result.kind === 'ok' && (
              <div
                className={
                  result.delivers
                    ? 'flex gap-3 rounded-md border-2 border-accent bg-teal-soft p-5'
                    : 'flex gap-3 rounded-md border-2 border-ink bg-ground p-5'
                }
              >
                {result.delivers ? (
                  <CircleCheck aria-hidden="true" className="size-6 shrink-0 text-accent" />
                ) : (
                  <Store aria-hidden="true" className="size-6 shrink-0 text-brand" />
                )}
                <div>
                  <h2 className="text-xl font-semibold">
                    {(result.delivers ? copy.results.delivers : copy.results.collect)(result.postcode, Math.round(result.miles)).heading}
                  </h2>
                  <p className="mt-1">
                    {(result.delivers ? copy.results.delivers : copy.results.collect)(result.postcode, Math.round(result.miles)).body}
                  </p>
                </div>
              </div>
            )}
            {(result.kind === 'invalid' || result.kind === 'not-found' || result.kind === 'unavailable') && (
              <div className="flex gap-3 rounded-md border-l-4 border-notice-line bg-notice p-5">
                <CircleAlert aria-hidden="true" className="size-6 shrink-0" />
                <p>
                  {result.kind === 'invalid'
                    ? copy.results.invalid
                    : result.kind === 'not-found'
                      ? copy.results.notFound(result.postcode)
                      : copy.results.unavailable}{' '}
                  <a href={`tel:${tel}`} className="font-semibold text-accent underline underline-offset-4">
                    {site.contact.phone}
                  </a>
                </p>
              </div>
            )}
          </div>

          <dl className="mt-10 divide-y divide-line border-y border-line">
            {copy.details.map((d) => (
              <div key={d.heading} className="py-5">
                <dt className="font-semibold">{d.heading}</dt>
                <dd className="mt-1 text-ink-muted">{d.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:sticky lg:top-6">
          <RadiusMap
            pin={result.kind === 'ok' ? { lat: result.lat, lng: result.lng, label: result.postcode, delivers: result.delivers } : undefined}
          />
          <details className="mt-6 rounded-md border border-line">
            <summary className="flex min-h-11 cursor-pointer items-center px-4 font-semibold">{copy.townsHeading}</summary>
            <table className="w-full text-sm">
              <caption className="sr-only">Approximate distance from our store to the centre of each postcode district</caption>
              <thead>
                <tr className="border-y border-line text-left text-ink-muted">
                  <th scope="col" className="px-4 py-2 font-medium">Town</th>
                  <th scope="col" className="px-4 py-2 font-medium">District</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Miles</th>
                  <th scope="col" className="px-4 py-2 font-medium">Delivery</th>
                </tr>
              </thead>
              <tbody>
                {[...districts].sort((a, b) => a.miles - b.miles).map((d) => (
                  <tr key={d.outcode} className="border-b border-line last:border-0">
                    <th scope="row" className="px-4 py-2 text-left font-medium">{d.town}</th>
                    <td className="px-4 py-2">{d.outcode}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{d.miles.toFixed(1)}</td>
                    <td className="px-4 py-2">{d.miles <= radiusMiles ? 'Yes' : 'Collect'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      </div>
    </Container>
  );
}
