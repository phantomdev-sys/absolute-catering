import { cn } from '@/lib/cn';

type ContainerProps = {
  children: React.ReactNode;
  /** `wide` for full-bleed-ish sections, `narrow` for reading measure. */
  width?: 'narrow' | 'default' | 'wide';
  className?: string;
};

const widths = {
  // ~65 characters at body size — the measure prose is comfortable at.
  narrow: 'max-w-2xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
} as const;

export function Container({ children, width = 'default', className }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-6 md:px-8', widths[width], className)}>{children}</div>
  );
}
