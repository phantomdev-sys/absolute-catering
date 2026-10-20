'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { listFavourites, toggleFavourite } from '@/lib/actions/favourites';

type Api = {
  signedIn: boolean | null;
  has: (slug: string) => boolean;
  toggle: (slug: string) => Promise<'added' | 'removed' | 'signin' | 'error'>;
};

const Ctx = createContext<Api | null>(null);

/** One request per page view for the customer's favourites; pages stay static. */
export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [slugs, setSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    let live = true;
    listFavourites()
      .then((r) => {
        if (!live) return;
        setSignedIn(r.signedIn);
        setSlugs(new Set(r.slugs));
      })
      .catch(() => live && setSignedIn(false));
    return () => {
      live = false;
    };
  }, []);

  const toggle = useCallback(async (slug: string) => {
    // Optimistic: flip now, put it back if the server says no.
    setSlugs((s) => {
      const n = new Set(s);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });
    const result = await toggleFavourite(slug).catch(() => 'error' as const);
    if (result === 'signin' || result === 'error') {
      setSlugs((s) => {
        const n = new Set(s);
        if (n.has(slug)) n.delete(slug);
        else n.add(slug);
        return n;
      });
    }
    return result;
  }, []);

  return <Ctx.Provider value={{ signedIn, has: (s) => slugs.has(s), toggle }}>{children}</Ctx.Provider>;
}

export function useFavourites(): Api {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFavourites must be used inside <FavouritesProvider>');
  return ctx;
}
