'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';

/**
 * The basket, held in the browser.
 *
 * Why client-side: reading a cookie in the header would make every page in
 * the shop render on demand. Keeping the basket here lets product and aisle
 * pages stay static and fast. It's only a list of slugs and quantities — the
 * server re-prices everything at checkout, so nothing here is trusted.
 *
 * localStorage can be missing or throw (private windows, blocked storage), so
 * every access is guarded; the worst case is a basket that doesn't survive a
 * reload, never a broken page.
 */

export type BasketLine = { slug: string; qty: number };

const KEY = 'acs-basket-v1';
const listeners = new Set<() => void>();
let cache: BasketLine[] | null = null;
const EMPTY: BasketLine[] = [];

function read(): BasketLine[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as BasketLine[]) : [];
    cache = Array.isArray(parsed)
      ? parsed.filter((l) => typeof l.slug === 'string' && Number.isInteger(l.qty) && l.qty > 0 && l.qty <= 99)
      : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(lines: BasketLine[]) {
  cache = lines;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Storage unavailable: the basket lives for this page view only.
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // Keep tabs in step: adding in one tab updates the badge in another.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

type BasketApi = {
  lines: BasketLine[];
  count: number;
  qtyOf: (slug: string) => number;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
};

const BasketContext = createContext<BasketApi | null>(null);

export function BasketProvider({ children }: { children: React.ReactNode }) {
  // Server snapshot is empty, so the first paint matches the static HTML and
  // the real basket appears straight after hydration.
  const lines = useSyncExternalStore(subscribe, read, () => EMPTY);

  const setQty = useCallback((slug: string, qty: number) => {
    const current = read();
    const next = qty <= 0
      ? current.filter((l) => l.slug !== slug)
      : current.some((l) => l.slug === slug)
        ? current.map((l) => (l.slug === slug ? { ...l, qty: Math.min(99, qty) } : l))
        : [...current, { slug, qty: Math.min(99, qty) }];
    write(next);
  }, []);

  // Stable identity: an effect that calls clear() must not re-run because the
  // basket it just emptied changed (that loop crashed the order-confirmed page).
  const clear = useCallback(() => {
    if (read().length > 0) write([]);
  }, []);

  const api = useMemo<BasketApi>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      qtyOf: (slug) => lines.find((l) => l.slug === slug)?.qty ?? 0,
      setQty,
      clear,
    }),
    [lines, setQty, clear],
  );

  return <BasketContext.Provider value={api}>{children}</BasketContext.Provider>;
}

export function useBasket(): BasketApi {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error('useBasket must be used inside <BasketProvider>');
  return ctx;
}
