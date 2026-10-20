import Link from 'next/link';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium ' +
  'transition-colors duration-200 ease-out-soft ' +
  'disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
  // line-strong, not line: this border is the only thing that makes the
  // control perceivable, so it falls under the non-text contrast rule.
  secondary: 'border border-line-strong bg-ground-raised text-ink hover:border-ink',
  ghost: 'text-accent underline underline-offset-4 hover:text-accent-hover',
};

const sizes: Record<Size, string> = {
  // min-h-11 keeps the touch target at 44px, which is what the mobile axe pass
  // checks for. Padding alone drifts below it as soon as the font changes.
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-13 px-7 text-base',
};

type CommonProps = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsLink = CommonProps & { href: string };
type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

/**
 * Renders an <a> when given href and a <button> otherwise. Getting this the
 * wrong way round is a real accessibility failure — a div-with-onClick isn't
 * keyboard operable, and a button that navigates can't be opened in a new tab.
 */
export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { children, variant = 'primary', size = 'md', className } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ('href' in props && props.href !== undefined) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { children: _children, variant: _v, size: _s, className: _c, ...buttonProps } = props;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
