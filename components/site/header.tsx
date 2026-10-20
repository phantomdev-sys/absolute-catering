import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Search, Truck, User } from 'lucide-react';
import { BasketLink } from '@/components/basket/basket-link';
import { site } from '@/content/site';
import { aisles } from '@/content/taxonomy';
import { Container } from '@/components/ui/container';
import { PostcodeForm } from '@/components/delivery/postcode-form';

/**
 * Grocer-style header, all Server Components and no JavaScript.
 *
 * Four bands, each with one job: who we are and how to reach us (plum strip),
 * find something (logo, search, basket), browse (aisle row — scrolls
 * sideways on small screens rather than hiding behind a hamburger, so every
 * aisle stays one tap away), and "will you deliver to me?" (Direction B's
 * persistent delivery bar).
 */
export function Header() {
  const tel = site.contact.phone.replace(/\s/g, '');

  return (
    <header>
      <div className="bg-ground-inverse text-ink-inverse">
        <Container width="wide" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2 text-sm">
          <p className="flex items-center gap-2">
            <Truck aria-hidden="true" className="size-4 shrink-0 text-teal" />
            <span>
              Delivery within 30 miles of Omagh <span aria-hidden="true">·</span> Click &amp; collect at Gortrush
            </span>
          </p>
          <p className="flex items-center gap-4">
            <a
              href={`tel:${tel}`}
              className="inline-flex min-h-8 items-center gap-1.5 font-semibold hover:underline focus-visible:outline-focus-inverse"
            >
              <Phone aria-hidden="true" className="size-4" />
              {site.contact.phone}
            </a>
          </p>
        </Container>
      </div>

      <div className="border-b border-line bg-ground">
        <Container width="wide" className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
          <Link href="/" className="shrink-0" aria-label={`${site.name} home`}>
            <Image
              src="/brand/logo.webp"
              alt=""
              width={853}
              height={294}
              priority
              className="h-11 w-auto md:h-14"
            />
          </Link>

          <form action="/search" method="get" role="search" className="order-3 flex w-full md:order-none md:flex-1">
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search bacon, chips, foil…"
              className="min-h-11 w-full min-w-0 rounded-l-md border border-r-0 border-line-strong bg-ground px-4"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-r-md bg-accent px-4 font-semibold text-accent-ink hover:bg-accent-hover"
            >
              <Search aria-hidden="true" className="size-4" />
              <span className="sr-only md:not-sr-only">Search</span>
            </button>
          </form>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link
              href="/account"
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 font-semibold hover:bg-ground-subtle"
            >
              <User aria-hidden="true" className="size-5" />
              <span className="sr-only sm:not-sr-only">Account</span>
            </Link>
            <BasketLink />
          </div>
        </Container>
      </div>

      <nav aria-label="Aisles" className="border-b border-line bg-ground">
        <Container width="wide">
          <ul className="-mx-2 flex gap-1 overflow-x-auto py-1 text-[0.9375rem] font-semibold">
            {aisles.map((a) => (
              <li key={a.slug} className="shrink-0">
                <Link href={`/shop/${a.slug}`} className="inline-flex min-h-11 items-center rounded-md px-3 hover:bg-ground-subtle">
                  {a.name}
                </Link>
              </li>
            ))}
            <li className="shrink-0">
              <Link href="/absolute-range" className="inline-flex min-h-11 items-center rounded-md px-3 text-brand hover:bg-ground-subtle">
                Absolute Range
              </Link>
            </li>
            <li className="ml-auto shrink-0">
              <Link href="/delivery" className="inline-flex min-h-11 items-center rounded-md px-3 font-medium text-ink-muted hover:bg-ground-subtle hover:text-ink">
                Delivery &amp; collection
              </Link>
            </li>
          </ul>
        </Container>
      </nav>

      <div className="border-b border-line bg-teal-soft">
        <Container width="wide" className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-6">
          <p className="flex shrink-0 items-center gap-2 font-semibold">
            <MapPin aria-hidden="true" className="size-5 text-brand" />
            Do we deliver to you?
          </p>
          <PostcodeForm id="header-postcode" label="Your postcode" hideLabel className="sm:flex-1" />
        </Container>
      </div>
    </header>
  );
}
