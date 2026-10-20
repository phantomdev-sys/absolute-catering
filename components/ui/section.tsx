import { cn } from '@/lib/cn';
import { Container } from './container';

type SectionProps = {
  children: React.ReactNode;
  /** Renders as <section> by default; pass 'div' inside an existing landmark. */
  as?: 'section' | 'div';
  tone?: 'default' | 'raised' | 'inverse';
  size?: 'default' | 'large';
  width?: 'narrow' | 'default' | 'wide';
  id?: string;
  className?: string;
  /** Section heading, used to label the landmark for screen readers. */
  'aria-labelledby'?: string;
};

const tones = {
  default: 'bg-ground text-ink',
  raised: 'bg-ground-raised text-ink',
  inverse: 'bg-ground-inverse text-ink-inverse',
} as const;

/**
 * Vertical rhythm comes from the --spacing-section tokens rather than ad-hoc
 * padding, which is what keeps pages built weeks apart feeling like one site.
 */
export function Section({
  children,
  as: Tag = 'section',
  tone = 'default',
  size = 'default',
  width = 'default',
  id,
  className,
  ...rest
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        tones[tone],
        size === 'large' ? 'py-section-lg' : 'py-section',
        className,
      )}
      {...rest}
    >
      <Container width={width}>{children}</Container>
    </Tag>
  );
}
