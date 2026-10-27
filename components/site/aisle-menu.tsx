'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LayoutGrid } from 'lucide-react';

type Item = { href: string; label: string; tone?: 'brand' | 'muted' };

/**
 * Phones and tablets: one "Shop by aisle" button that opens the full list, so
 * no aisle is hidden off the edge of a sideways-scrolling strip and the page
 * never needs scrolling sideways. Built on <details>, so it works before
 * JavaScript loads; keyed on the path so it closes after a link is tapped.
 */
export function AisleMenu({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <details key={pathname} className="group lg:hidden">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold [&::-webkit-details-marker]:hidden">
        <LayoutGrid aria-hidden="true" className="size-4 text-accent" />
        Shop by aisle
        <ChevronDown aria-hidden="true" className="ml-auto size-5 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="grid grid-cols-2 gap-x-2 border-t border-line pb-2 pt-1 text-[0.9375rem] font-semibold">
        {items.map((i) => (
          <li key={i.href} className="min-w-0">
            <Link
              href={i.href}
              aria-current={pathname === i.href ? 'page' : undefined}
              className={`flex min-h-11 items-center rounded-md px-2 hover:bg-ground-subtle aria-[current=page]:bg-ground-subtle ${
                i.tone === 'brand' ? 'text-brand' : i.tone === 'muted' ? 'font-medium text-ink-muted' : ''
              }`}
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
