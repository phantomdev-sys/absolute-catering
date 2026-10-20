import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { aisles } from '@/content/taxonomy';
import { aisleCounts, getAisle, getAisleProducts } from '@/lib/catalogue';
import { AislePage } from '@/components/shop/aisle-page';

type Params = { params: Promise<{ aisle: string }> };

export function generateStaticParams() {
  return aisles.map((a) => ({ aisle: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const aisle = getAisle((await params).aisle);
  return aisle ? { title: aisle.name, description: aisle.blurb } : {};
}

export default async function Page({ params }: Params) {
  const aisle = getAisle((await params).aisle);
  if (!aisle) notFound();
  const [products, counts] = await Promise.all([getAisleProducts(aisle.slug), aisleCounts()]);
  return <AislePage aisle={aisle} products={products} counts={counts} />;
}
