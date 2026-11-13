import { formatPrice, type Product } from '@/lib/catalogue';
import { cn } from '@/lib/cn';

/**
 * Price, or an honest gap. Prices come from the client (data sheet, or the price
 * printed on the pack/sticker in his photos); a product without one shows
 * "Price to follow" and can't be added to a basket.
 */
export function Price({ product, size = 'md', className }: { product: Product; size?: 'md' | 'lg'; className?: string }) {
  // No longer sold (data/client/availability.json): say so instead of a price.
  if (product.status === 'withdrawn') {
    return (
      <p
        className={cn(
          'inline-flex items-center self-start rounded-sm border border-line-strong px-2 py-0.5 font-semibold',
          size === 'lg' ? 'text-base' : 'text-sm',
          className,
        )}
      >
        Not in stock
      </p>
    );
  }
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
