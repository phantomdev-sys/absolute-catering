import { cn } from '@/lib/cn';

/**
 * The Absolute Range mark, styled after the shop's own white product
 * stickers: a plain label with the shop's name, not a coloured promo flash.
 */
export function OwnBrandBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border border-brand bg-ground px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-brand',
        className,
      )}
    >
      Absolute Range
    </span>
  );
}
