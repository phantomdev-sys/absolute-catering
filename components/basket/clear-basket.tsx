'use client';

import { useEffect, useRef } from 'react';
import { useBasket } from './basket-provider';

/** Empties the basket once an order is confirmed (once per page view). */
export function ClearBasket() {
  const { clear } = useBasket();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    clear();
  }, [clear]);
  return null;
}
