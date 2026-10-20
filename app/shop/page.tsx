import type { Metadata } from 'next';
import Link from 'next/link';
import { aisles } from '@/content/taxonomy';
import { aisleCounts } from '@/lib/catalogue';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Breadcrumbs } from '@/components/shop/breadcrumbs';

export const metadata: Metadata = {
  title: 'Shop all aisles',
  description: 'Browse fresh, frozen, gluten-free, household and seasonal lines from Absolute Catering Supplies in Omagh.',
};

export default async function ShopPage() {
  const counts = await aisleCounts();
  return (
    <Container width="wide" className="py-8 md:py-10">
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Shop' }]} />
      <Heading level={1} size="lg" className="mt-4">
        All aisles
      </Heading>
      <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {aisles.map((a) => (
          <li key={a.slug} className="bg-ground p-6">
            <h2 className="font-display text-2xl font-semibold">
              <Link href={`/shop/${a.slug}`} className="hover:underline hover:underline-offset-4">
                {a.name}
              </Link>
            </h2>
            <p className="mt-1 text-sm tabular-nums text-ink-muted">{counts[a.slug]} products</p>
            <p className="mt-3 text-ink-muted">{a.blurb}</p>
            <ul className="mt-4 space-y-1 text-sm font-medium">
              {a.shelves
                .filter((s) => (counts[`${a.slug}/${s.slug}`] ?? 0) > 0)
                .map((s) => (
                  <li key={s.slug}>
                    <Link href={`/shop/${a.slug}/${s.slug}`} className="inline-flex min-h-8 items-center text-accent hover:underline">
                      {s.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </Container>
  );
}
