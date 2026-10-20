'use client';

import { useEffect } from 'react';
import { useBasket } from './basket-provider';

/** Empties the basket once an order is confirmed. */
export function ClearBasket() {
  const { clear } = useBasket();
  useEffect(() => clear(), [clear]);
  return null;
}
