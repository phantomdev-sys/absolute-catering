import type { Metadata } from 'next';
import Image from 'next/image';
import { aboutPage as copy } from '@/content/pages';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';

export const metadata: Metadata = { title: copy.title, description: copy.intro };

// Facts only until the client gives us their story in their own words.
export default function AboutPage() {
  return (
    <Container width="wide" className="py-section">
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <div>
          <Heading level={1} size="lg">{copy.title}</Heading>
          <p className="mt-4 text-xl">{copy.intro}</p>
          {copy.body.map((p) => (
            <p key={p} className="mt-4 text-lg text-ink-muted">{p}</p>
          ))}
          <p className="mt-4 text-ink-muted">{copy.awaiting}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Image src="/images/store/freezer-aisle.webp" alt="The freezer aisle in the shop" width={1044} height={766} sizes="(min-width: 1024px) 25vw, 50vw" className="col-span-2 h-auto w-full rounded-md" />
          <Image src="/images/store/chilled-counter.webp" alt="The chilled counter with cooked meats and kebabs" width={1060} height={1074} sizes="(min-width: 1024px) 12vw, 50vw" className="h-full w-full rounded-md object-cover" />
          <Image src="/images/store/household-aisle.webp" alt="A household aisle stocked with packaging and party goods" width={900} height={1200} sizes="(min-width: 1024px) 12vw, 50vw" className="h-full w-full rounded-md object-cover" />
        </div>
      </div>
    </Container>
  );
}
