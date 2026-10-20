import type { Metadata } from 'next';
import { getProducts } from '@/lib/catalogue';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { ProductImage } from '@/components/shop/product-image';
import { BasketView, type BasketProduct } from '@/components/basket/basket-view';

export const metadata: Metadata = { title: 'Basket', robots: { index: false } };

/**
 * The page is static; the basket itself lives in the browser. The server
 * hands over the catalogue (name, price, thumbnail) so lines are always priced
 * from current data, never from anything stored client-side.
 */
export default async function BasketPage() {
  const products = await getProducts();
  const catalogue: Record<string, BasketProduct> = {};
  const thumbs: Record<string, React.ReactNode> = {};
  for (const p of products) {
    if (p.status !== 'live' || p.pricePence == null) continue;
    catalogue[p.slug] = { slug: p.slug, name: p.name, pricePence: p.pricePence, ownBrand: p.ownBrand };
    thumbs[p.slug] = <ProductImage product={p} sizes="96px" className="w-20 rounded-sm sm:w-24 [&_span]:hidden" />;
  }

  return (
    <Container width="wide" className="py-8 md:py-10">
      <Heading level={1} size="lg">
        Your basket
      </Heading>
      <BasketView catalogue={catalogue} thumbs={thumbs} />
    </Container>
  );
}
