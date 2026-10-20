import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Snowflake, Thermometer, Package, Truck } from 'lucide-react';
import { getProduct, getProducts, primaryPlacement, relatedProducts, type Storage } from '@/lib/catalogue';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Breadcrumbs, type Crumb } from '@/components/shop/breadcrumbs';
import { ProductImage, packshotFor } from '@/components/shop/product-image';
import { Price } from '@/components/shop/price';
import { OwnBrandBadge } from '@/components/shop/own-brand-badge';
import { AllergenLabel } from '@/components/shop/allergen-label';
import { ProductGrid } from '@/components/shop/product-grid';

type Params = { params: Promise<{ slug: string }> };

// Same URL shape as WooCommerce, so existing links and search rankings carry over.
export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.name} from Absolute Catering Supplies, Omagh. Delivered within 30 miles or click & collect.`,
    alternates: { canonical: `/product/${product.slug}` },
  };
}

const STORAGE: Record<Storage, { label: string; icon: typeof Snowflake }> = {
  frozen: { label: 'Frozen', icon: Snowflake },
  chilled: { label: 'Keep refrigerated', icon: Thermometer },
  ambient: { label: 'Store in a cool, dry place', icon: Package },
};

export default async function ProductPage({ params }: Params) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const home = primaryPlacement(product);
  const related = await relatedProducts(product, 5);
  const back = packshotFor(product.slug).back;
  const crumbs: Crumb[] = [{ href: '/', label: 'Home' }];
  if (home) {
    crumbs.push({ href: `/shop/${home.aisle.slug}`, label: home.aisle.name });
    if (home.shelf) crumbs.push({ href: `/shop/${home.aisle.slug}/${home.shelf.slug}`, label: home.shelf.name });
  } else if (product.ownBrand) {
    crumbs.push({ href: '/absolute-range', label: 'Absolute Range' });
  }
  crumbs.push({ label: product.name });
  const storage = product.storage ? STORAGE[product.storage] : null;
  const canBuy = product.status === 'live' && product.pricePence != null;

  return (
    <>
      <Container width="wide" className="py-8 md:py-10">
        <Breadcrumbs items={crumbs} />

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className="space-y-4">
            <ProductImage
              product={product}
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="rounded-md border border-line"
            />
            {back && (
              <figure className="relative aspect-square overflow-hidden rounded-md border border-line">
                <Image src={back} alt={`Back of pack: ${product.name}`} fill sizes="40vw" className="object-contain p-3" />
              </figure>
            )}
          </div>

          <div>
            {product.ownBrand && <OwnBrandBadge />}
            <Heading level={1} size="lg" className="mt-2">
              {product.name}
            </Heading>
            {product.packSize && <p className="mt-2 text-lg text-ink-muted">{product.packSize}</p>}

            <div className="mt-6 border-y border-line py-6">
              <Price product={product} size="lg" />
              {canBuy ? null : (
                <p className="mt-3 text-sm text-ink-muted">
                  Online ordering for this product opens once its price and allergen details are confirmed. You can
                  buy it in store now.
                </p>
              )}
            </div>

            <ul className="mt-6 space-y-3 text-[0.9375rem]">
              {storage && (
                <li className="flex items-center gap-3">
                  <storage.icon aria-hidden="true" className="size-5 text-brand" />
                  {storage.label}
                </li>
              )}
              <li className="flex items-start gap-3">
                <Truck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" />
                <span>
                  Delivered in our refrigerated van within 30 miles of Omagh, or click &amp; collect.{' '}
                  <Link href="/delivery" className="font-semibold text-accent underline underline-offset-4">
                    Check your postcode
                  </Link>
                </span>
              </li>
            </ul>

            <div className="mt-8">
              <AllergenLabel product={product} />
            </div>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-line bg-ground-subtle py-section">
          <Container width="wide">
            <Heading level={2} size="md" id="related-heading">
              More from {home?.shelf?.name ?? home?.aisle.name ?? 'the shop'}
            </Heading>
            <div className="mt-6">
              <ProductGrid products={related} />
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
