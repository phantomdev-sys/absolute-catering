import { formatPrice, type Product } from '@/lib/catalogue';
import { cn } from '@/lib/cn';

/**
 * Price, or an honest gap. Prices come from the client (data sheet, or the price
 * printed on the pack/sticker in his photos); a product without one shows
 * "Price to follow" and can't be added to a basket.
 */
export function Price({ product, size = 'md', className }: { product: Product; size?: 'md' | 'lg'; className?: string }) {
  if (product.pricePence == null) {
    return (
      <p className={cn('text-ink-muted', size === 'lg' ? 'text-lg' : 'text-sm', className)}>Price to follow</p>
    );
  }
  return (
    <p className={cn('font-bold tabular-nums', size === 'lg' ? 'text-3xl' : 'text-lg', className)}>
      {formatPrice(product.pricePence)}
    </p>
  );
}
