import type { Metadata } from 'next';
import { getOwnBrand } from '@/lib/catalogue';
import Image from 'next/image';
import { home } from '@/content/home';
import { ownBrandBanner } from '@/content/images';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Breadcrumbs } from '@/components/shop/breadcrumbs';
import { ProductGrid } from '@/components/shop/product-grid';

export const metadata: Metadata = {
  title: 'The Absolute Range',
  description: home.ownBrand.body,
};

export default async function AbsoluteRangePage() {
  const products = await getOwnBrand();
  return (
    <Container width="wide" className="py-8 md:py-10">
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Absolute Range' }]} />
      <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-brand">{home.ownBrand.eyebrow}</p>
      <Heading level={1} size="lg" className="mt-2">
        {home.ownBrand.heading}
      </Heading>
      <p className="mt-3 max-w-2xl text-lg text-ink-muted">{home.ownBrand.body}</p>
      <p className="mt-2 text-sm tabular-nums text-ink-muted">{products.length} products</p>
      <Image
        src={ownBrandBanner.src}
        alt={ownBrandBanner.alt}
        width={ownBrandBanner.width}
        height={ownBrandBanner.height}
        sizes="(min-width: 1280px) 1216px, 100vw"
        className="mt-6 h-44 w-full rounded-md object-cover md:h-64"
      />
      <div className="mt-8">
        <ProductGrid products={products} priorityCount={5} />
      </div>
    </Container>
  );
}
