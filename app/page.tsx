import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Phone } from 'lucide-react';
import { site } from '@/content/site';
import { home } from '@/content/home';
import { heroImage, ownBrandBanner } from '@/content/images';
import { districts, radiusMiles } from '@/content/delivery';
import { aisles } from '@/content/taxonomy';
import { aisleCounts, getOwnBrand } from '@/lib/catalogue';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { RadiusMap } from '@/components/delivery/radius-map';
import { PostcodeForm } from '@/components/delivery/postcode-form';
import { ProductGrid } from '@/components/shop/product-grid';

export default async function HomePage() {
  const [counts, ownBrand] = await Promise.all([aisleCounts(), getOwnBrand()]);

  return (
    <>
      {/* Hero: appetite first, the delivery promise straight after. */}
      <section aria-labelledby="hero-heading" className="relative border-b border-line bg-ground">
        <div className="relative aspect-[16/9] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-1/2">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <Container width="wide" className="relative lg:grid lg:min-h-[36rem] lg:grid-cols-2 lg:items-center">
          <div className="py-10 md:py-14 lg:pr-12">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">{home.hero.eyebrow}</p>
            <Heading level={1} size="xl" id="hero-heading" className="mt-3 max-w-[18ch]">
              {home.hero.heading}
            </Heading>
            <p className="mt-5 max-w-[52ch] text-lg text-ink-muted">{home.hero.body}</p>

            <div className="mt-8 max-w-md rounded-md border border-line bg-ground-subtle p-5">
              <PostcodeForm id="hero-postcode" size="lg" label={home.hero.formLabel} />
              <p className="mt-3 text-sm text-ink-muted">{home.hero.formNote}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* The signature: where the van goes. */}
      <section aria-labelledby="area-heading" className="border-b border-line bg-ground-subtle py-section">
        <Container width="wide" className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">{home.area.eyebrow}</p>
            <Heading level={2} size="lg" id="area-heading" className="mt-2">
              {home.area.heading}
            </Heading>
            <p className="mt-3 text-lg text-ink-muted">{home.area.body}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {districts
                .filter((d) => d.miles <= radiusMiles)
                .sort((a, b) => a.miles - b.miles)
                .map((d) => (
                  <li key={d.outcode} className="rounded-full border border-line-strong bg-ground px-3 py-1 text-sm font-medium">
                    {d.town}
                  </li>
                ))}
            </ul>
            <Link href="/delivery" className="mt-6 inline-flex min-h-11 items-center gap-1 font-semibold text-accent hover:underline">
              {home.area.link} <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <RadiusMap className="mx-auto w-full max-w-xl" />
        </Container>
      </section>

      {/* Aisle index — a ruled list, not a wall of identical cards. */}
      <section aria-labelledby="aisles-heading" className="py-section">
        <Container width="wide">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Heading level={2} size="lg" id="aisles-heading">
              {home.aisles.heading}
            </Heading>
            <Link href="/shop" className="inline-flex min-h-11 items-center gap-1 font-semibold text-accent hover:underline">
              {home.aisles.link} <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <ul className="mt-8 grid border-t-2 border-ink md:grid-cols-2 md:gap-x-12">
            {aisles.map((a) => (
              <li key={a.slug} className="border-b border-line py-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl font-semibold">
                    <Link href={`/shop/${a.slug}`} className="hover:underline hover:underline-offset-4">
                      {a.name}
                    </Link>
                  </h3>
                  <span className="shrink-0 text-sm tabular-nums text-ink-muted">
                    {counts[a.slug]} {counts[a.slug] === 1 ? 'product' : 'products'}
                  </span>
                </div>
                <p className="mt-1 text-ink-muted">{a.blurb}</p>
                {a.shelves.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
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
                )}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Own brand */}
      <section aria-labelledby="own-heading" className="bg-ground-subtle py-section">
        <Container width="wide">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">{home.ownBrand.eyebrow}</p>
              <Heading level={2} size="lg" id="own-heading" className="mt-2">
                {home.ownBrand.heading}
              </Heading>
              <p className="mt-3 text-ink-muted">{home.ownBrand.body}</p>
            </div>
            <Link href="/absolute-range" className="inline-flex min-h-11 items-center gap-1 font-semibold text-accent hover:underline">
              {home.ownBrand.link(ownBrand.length)} <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_3fr]">
            <Image
              src={ownBrandBanner.src}
              alt={ownBrandBanner.alt}
              width={ownBrandBanner.width}
              height={ownBrandBanner.height}
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="h-full max-h-[34rem] w-full rounded-md object-cover"
            />
            <ProductGrid products={ownBrand.slice(0, 6)} variant="compact" />
          </div>
        </Container>
      </section>

      {/* How it works — a numbered sequence, because it is one. */}
      <section aria-labelledby="how-heading" className="py-section">
        <Container width="wide">
          <Heading level={2} size="lg" id="how-heading">
            {home.how.heading}
          </Heading>
          <ol className="mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
            {home.how.steps.map((step, i) => (
              <li key={step.title} className="bg-ground p-6">
                <span className="font-display text-4xl font-semibold text-brand tabular-nums" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-ink-muted">
            {home.how.paymentNote}{' '}
            <Link href="/payments" className="font-semibold text-accent underline underline-offset-4">
              How payment works
            </Link>
          </p>
        </Container>
      </section>

      {/* The real shop. */}
      <section aria-labelledby="visit-heading" className="border-t border-line bg-ground-subtle py-section">
        <Container width="wide" className="grid items-center gap-10 md:grid-cols-2">
          <Image
            src="/images/store/delivery-van.webp"
            alt={home.visit.vanAlt}
            width={828}
            height={628}
            sizes="(min-width: 768px) 45vw, 100vw"
            className="h-auto w-full rounded-md"
          />
          <div>
            <Heading level={2} size="lg" id="visit-heading">
              {home.visit.heading}
            </Heading>
            <p className="mt-3 text-lg text-ink-muted">{home.visit.body}</p>
            <address className="mt-6 space-y-2 not-italic">
              <p className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" />
                <span>{site.contact.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone aria-hidden="true" className="size-5 shrink-0 text-brand" />
                <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="font-semibold text-accent hover:underline">
                  {site.contact.phone}
                </a>
              </p>
            </address>
            <Link
              href={home.visit.mapsUrl}
              className="mt-6 inline-flex min-h-11 items-center gap-1 font-semibold text-accent hover:underline"
            >
              {home.visit.mapsLabel} <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
