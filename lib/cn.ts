/**
 * Minimal class-name joiner. Deliberately not clsx + tailwind-merge — a
 * marketing site rarely needs conflict resolution, and every dependency is a
 * decision worth justifying.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
