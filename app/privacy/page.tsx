import type { Metadata } from 'next';
import { legal } from '@/content/legal';
import { Section } from '@/components/ui/section';
import { Heading } from '@/components/ui/heading';
import { Markdown } from '@/components/ui/markdown';

export const metadata: Metadata = { title: 'Privacy' };

// Content comes from content/legal.ts and is rendered through the safe
// markdown renderer — no dangerouslySetInnerHTML anywhere in the site.
export default function PrivacyPage() {
  return (
    <Section width="narrow">
      <Heading level={1} size="lg">
        Privacy
      </Heading>
      <Markdown className="mt-8">{legal.privacy}</Markdown>
    </Section>
  );
}
