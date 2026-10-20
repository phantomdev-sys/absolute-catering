import { cn } from '@/lib/cn';

type CardProps = {
  children: React.ReactNode;
  /**
   * `plain` has no border, no shadow and no radius. It is the default on
   * purpose: identical rounded card grids are on the anti-pattern list, and
   * making the bordered variant opt-in is the cheapest way to avoid drifting
   * into one.
   */
  variant?: 'plain' | 'bordered' | 'inverse';
  className?: string;
};

const variants = {
  plain: '',
  bordered: 'rounded-lg border border-line bg-ground-raised p-6',
  inverse: 'rounded-lg bg-ground-inverse text-ink-inverse p-6',
} as const;

export function Card({ children, variant = 'plain', className }: CardProps) {
  return <div className={cn(variants[variant], className)}>{children}</div>;
}
