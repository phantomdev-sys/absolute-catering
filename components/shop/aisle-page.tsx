import Link from 'next/link';
import type { Aisle, Shelf } from '@/content/taxonomy';
import type { Product } from '@/lib/catalogue';
import { cn } from '@/lib/cn';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Breadcrumbs } from './breadcrumbs';
import { ProductGrid } from './product-grid';

/**
 * Shared layout for an aisle and for one of its shelves. Shelves are plain
 * links styled as filter chips, so every filtered view is a real, static,
 * shareable URL rather than client-side state.
 */
export function AislePage({
  aisle,
  shelf,
  products,
  counts,
}: {
  aisle: Aisle;
  shelf?: Shelf;
  products: Product[];
  counts: Record<string, number>;
}) {
  const shelves = aisle.shelves.filter((s) => (counts[`${aisle.slug}/${s.slug}`] ?? 0) > 0);
  const chip = 'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold';

  return (
    <Container width="wide" className="py-8 md:py-10">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { href: '/shop', label: 'Shop' },
          shelf ? { href: `/shop/${aisle.slug}`, label: aisle.name } : { label: aisle.name },
          ...(shelf ? [{ label: shelf.name }] : []),
        ]}
      />
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <Heading level={1} size="lg">
          {shelf ? shelf.name : aisle.name}
        </Heading>
        <p className="text-sm tabular-nums text-ink-muted" aria-live="polite">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
      </div>
      {!shelf && <p className="mt-2 max-w-2xl text-ink-muted">{aisle.blurb}</p>}

      {shelves.length > 1 && (
        <nav aria-label={`${aisle.name} shelves`} className="mt-6">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href={`/shop/${aisle.slug}`}
                aria-current={!shelf ? 'page' : undefined}
                className={cn(chip, !shelf ? 'border-brand bg-brand text-brand-ink' : 'border-line-strong hover:border-ink')}
              >
                All {aisle.name.toLowerCase()}
              </Link>
            </li>
            {shelves.map((s) => {
              const active = shelf?.slug === s.slug;
              return (
                <li key={s.slug}>
                  <Link
                    href={`/shop/${aisle.slug}/${s.slug}`}
                    aria-current={active ? 'page' : undefined}
                    className={cn(chip, active ? 'border-brand bg-brand text-brand-ink' : 'border-line-strong hover:border-ink')}
                  >
                    {s.name}
                    <span className={cn('ml-1.5 tabular-nums', active ? 'opacity-80' : 'text-ink-muted')}>
                      {counts[`${aisle.slug}/${s.slug}`]}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <div className="mt-8">
        {products.length > 0 ? (
          <ProductGrid products={products} priorityCount={5} />
        ) : (
          <p className="border border-line bg-ground-subtle p-6 text-ink-muted">
            Nothing on this shelf online yet. Pop in or give us a call; there’s far more in store than on the website.
          </p>
        )}
      </div>
    </Container>
  );
}
