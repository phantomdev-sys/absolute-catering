import type { Metadata } from 'next';
import { paymentsPage as copy } from '@/content/pages';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Breadcrumbs } from '@/components/shop/breadcrumbs';

export const metadata: Metadata = { title: copy.title, description: copy.intro };

export default function PaymentsPage() {
  return (
    <Container width="narrow" className="py-8 md:py-10">
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: copy.title }]} />
      <Heading level={1} size="lg" className="mt-6">
        {copy.title}
      </Heading>
      <p className="mt-3 text-lg">{copy.intro}</p>

      {copy.sections.map((s) => (
        <section key={s.heading} className="mt-10">
          <Heading level={2} size="md">{s.heading}</Heading>
          <ol className="mt-4 space-y-3">
            {s.steps.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span aria-hidden="true" className="font-display text-xl font-semibold text-brand tabular-nums">{i + 1}</span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}

      {[copy.statement, copy.window, copy.security].map((s) => (
        <section key={s.heading} className="mt-10 border-t border-line pt-8">
          <Heading level={2} size="md">{s.heading}</Heading>
          {(Array.isArray(s.body) ? s.body : [s.body]).map((p) => (
            <p key={p} className="mt-3 text-ink-muted">{p}</p>
          ))}
        </section>
      ))}
    </Container>
  );
}
