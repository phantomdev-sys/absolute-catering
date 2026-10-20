import { Section } from '@/components/ui/section';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <Section size="large">
      <Heading level={1} size="lg">
        That page isn’t here
      </Heading>
      {/* Say what to do next rather than apologising at length — a 404 is a
          navigation problem, and the fix is a route out of it. */}
      <p className="mt-4 max-w-lg text-ink-muted">
        The page may have moved, or the link that brought you here may be out of date.
      </p>
      <div className="mt-8">
        <Button href="/">Back to the homepage</Button>
      </div>
    </Section>
  );
}
