import { cn } from '@/lib/cn';

type HeadingProps = {
  children: React.ReactNode;
  /** Semantic level — choose from document structure, not from size. */
  level: 1 | 2 | 3 | 4;
  /** Visual size, decoupled from level so hierarchy never fights semantics. */
  size?: 'xl' | 'lg' | 'md' | 'sm';
  id?: string;
  className?: string;
};

const sizes = {
  xl: 'text-4xl md:text-6xl leading-[1.05] tracking-tight font-semibold',
  lg: 'text-3xl md:text-4xl leading-[1.1] tracking-tight font-semibold',
  md: 'text-xl md:text-2xl leading-snug font-semibold',
  sm: 'text-base md:text-lg leading-snug font-semibold',
} as const;

const defaultSizeForLevel = { 1: 'xl', 2: 'lg', 3: 'md', 4: 'sm' } as const;

/**
 * Level and size are separate props on purpose. Headings must descend without
 * skipping levels for screen readers, but a design often wants an h2 that
 * reads smaller than an h3 elsewhere. Coupling the two is how sites end up
 * with an h4 chosen because it "looked right".
 */
export function Heading({ children, level, size, id, className }: HeadingProps) {
  const Tag = `h${level}` as const;
  const resolved = size ?? defaultSizeForLevel[level];

  return (
    <Tag id={id} className={cn('font-display', sizes[resolved], className)}>
      {children}
    </Tag>
  );
}
