import type { Metadata } from 'next';
import Link from 'next/link';
import { aisles } from '@/content/taxonomy';
import { searchProducts } from '@/lib/catalogue';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { ProductGrid } from '@/components/shop/product-grid';

export const metadata: Metadata = { title: 'Search', robots: { index: false } };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function SearchPage({ searchParams }: Props) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 80) ?? '';
  const results = q ? await searchProducts(q) : [];

  return (
    <Container width="wide" className="py-8 md:py-10">
      <Heading level={1} size="lg">
        {q ? <>Results for “{q}”</> : 'Search'}
      </Heading>
      {q && (
        <p className="mt-2 text-ink-muted" aria-live="polite">
          {results.length} {results.length === 1 ? 'product' : 'products'}
        </p>
      )}

      {results.length > 0 ? (
        <div className="mt-8">
          <ProductGrid products={results} priorityCount={5} />
        </div>
      ) : (
        <div className="mt-8 max-w-2xl border border-line bg-ground-subtle p-6">
          <p className="font-semibold">{q ? 'Nothing online matches that yet.' : 'Type in the search box above to find a product.'}</p>
          <p className="mt-2 text-ink-muted">
            There’s a lot more in store than on the website so far, so it’s worth giving us a call. Or browse an aisle:
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {aisles.map((a) => (
              <li key={a.slug}>
                <Link href={`/shop/${a.slug}`} className="inline-flex min-h-10 items-center rounded-full border border-line-strong px-4 text-sm font-semibold hover:border-ink">
                  {a.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Container>
  );
}
