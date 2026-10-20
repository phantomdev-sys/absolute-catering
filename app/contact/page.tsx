import type { Metadata } from 'next';
import { site } from '@/content/site';
import { Section } from '@/components/ui/section';
import { Heading } from '@/components/ui/heading';
import { ContactForm } from './contact-form';

export const metadata: Metadata = { title: 'Contact' };

/**
 * A form alone is not enough: consumer-facing businesses need a way to be
 * contacted that isn't only a form, which is why the email address and phone
 * number are rendered alongside it.
 */
export default function ContactPage() {
  return (
    <Section width="narrow">
      <Heading level={1} size="lg">
        Contact
      </Heading>

      <div className="mt-6 space-y-1 text-lg text-ink-muted">
        {site.contact.email && (
          <p>
            <a href={`mailto:${site.contact.email}`} className="text-accent underline underline-offset-4">
              {site.contact.email}
            </a>
          </p>
        )}
        {site.contact.phone && (
          <p>
            <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="text-accent underline underline-offset-4">
              {site.contact.phone}
            </a>
          </p>
        )}
        {site.contact.address && <p>{site.contact.address}</p>}
      </div>

      <ContactForm />
    </Section>
  );
}
