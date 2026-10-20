import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Postcode checker. A plain GET form to /delivery — it works with JavaScript
 * off, the result is a shareable URL, and there is no client bundle at all.
 *
 * Label on its own line, then input and button on one row that never wraps:
 * at 320px the button keeps its size and the input takes what's left.
 */
export function PostcodeForm({
  defaultValue,
  size = 'md',
  id = 'postcode',
  label = 'Your postcode',
  hideLabel = false,
  className,
}: {
  defaultValue?: string;
  size?: 'md' | 'lg';
  id?: string;
  label?: string;
  hideLabel?: boolean;
  className?: string;
}) {
  const h = size === 'lg' ? 'min-h-13 text-lg' : 'min-h-11';
  return (
    <form action="/delivery" method="get" className={cn('w-full', className)}>
      <label htmlFor={id} className={cn('mb-1.5 block text-sm font-semibold', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          name="postcode"
          type="text"
          autoComplete="postal-code"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={10}
          placeholder="e.g. BT79 7AB"
          defaultValue={defaultValue}
          required
          className={cn(
            'w-full min-w-0 flex-1 rounded-md border border-line-strong bg-ground px-3 uppercase placeholder:normal-case placeholder:text-ink-muted',
            h,
          )}
        />
        <button
          type="submit"
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-5 font-semibold text-accent-ink transition-colors hover:bg-accent-hover',
            h,
          )}
        >
          <Search aria-hidden="true" className="size-4" />
          Check
        </button>
      </div>
    </form>
  );
}
