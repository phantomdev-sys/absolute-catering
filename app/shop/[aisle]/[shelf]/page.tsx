import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { aisles } from '@/content/taxonomy';
import { aisleCounts, getAisle, getAisleProducts } from '@/lib/catalogue';
import { AislePage } from '@/components/shop/aisle-page';

type Params = { params: Promise<{ aisle: string; shelf: string }> };

export function generateStaticParams() {
  return aisles.flatMap((a) => a.shelves.map((s) => ({ aisle: a.slug, shelf: s.slug })));
}

function resolve(aisleSlug: string, shelfSlug: string) {
  const aisle = getAisle(aisleSlug);
  const shelf = aisle?.shelves.find((s) => s.slug === shelfSlug);
  return aisle && shelf ? { aisle, shelf } : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await params;
  const r = resolve(p.aisle, p.shelf);
  return r ? { title: `${r.shelf.name} · ${r.aisle.name}` } : {};
}

export default async function Page({ params }: Params) {
  const p = await params;
  const r = resolve(p.aisle, p.shelf);
  if (!r) notFound();
  const [products, counts] = await Promise.all([getAisleProducts(r.aisle.slug, r.shelf.slug), aisleCounts()]);
  return <AislePage aisle={r.aisle} shelf={r.shelf} products={products} counts={counts} />;
}
