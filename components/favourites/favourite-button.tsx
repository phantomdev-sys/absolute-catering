'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFavourites } from './favourites-provider';

/** Heart toggle. Signed-out customers are sent to sign in and brought back. */
export function FavouriteButton({
  slug,
  name,
  size = 'sm',
  className,
}: {
  slug: string;
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { has, toggle } = useFavourites();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const on = has(slug);

  async function onClick() {
    setBusy(true);
    const result = await toggle(slug);
    setBusy(false);
    if (result === 'signin') {
      router.push(`/account/sign-in?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border bg-ground transition-colors',
        on ? 'border-brand text-brand' : 'border-line-strong text-ink hover:border-ink',
        size === 'md' ? 'min-h-12 px-5 font-semibold' : 'size-10',
        className,
      )}
    >
      <Heart aria-hidden="true" className={cn('size-5', on && 'fill-current')} />
      {size === 'md' && (on ? 'Saved to favourites' : 'Add to favourites')}
    </button>
  );
}
