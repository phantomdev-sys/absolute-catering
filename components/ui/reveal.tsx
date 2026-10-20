import { cn } from '@/lib/cn';

type RevealProps = {
  children: React.ReactNode;
  /** Staggers the reveal slightly. Use sparingly — more than two feels fussy. */
  delayed?: boolean;
  as?: 'div' | 'section' | 'li' | 'article';
  className?: string;
};

/**
 * Scroll reveal — CSS only, no JavaScript, no client component.
 *
 * The element is fully visible with no CSS applied at all; the animation is
 * layered on top in globals.css behind `@supports (animation-timeline: view())`
 * and a reduced-motion check. That ordering is the whole point: the worst case
 * has to be "no animation", never "no content".
 *
 * The usual alternative — IntersectionObserver plus `opacity: 0` — fails the
 * other way. If the script doesn't run, the content is permanently invisible,
 * and every automated check still passes because the markup is present. That
 * exact bug shipped once and was only caught by looking at a screenshot.
 */
export function Reveal({ children, delayed = false, as: Tag = 'div', className }: RevealProps) {
  return <Tag className={cn(delayed ? 'reveal-delayed' : 'reveal', className)}>{children}</Tag>;
}
