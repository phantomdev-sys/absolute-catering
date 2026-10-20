import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { SignInForm } from '@/components/account/auth-forms';

// Per-customer and session-dependent: never prerender or cache.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function Page({ searchParams }: Props) {
  const raw = (await searchParams).next ?? '/account';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/account';
  if (await currentUser()) redirect(next);
  return (
    <Container width="narrow" className="max-w-md py-section">
      <Heading level={1} size="lg">Sign in</Heading>
      {next === '/checkout' && (
        <p className="mt-3 text-ink-muted">You’ll need an account to check out, so we can show your orders and book your slot.</p>
      )}
      <div className="mt-8">
        <SignInForm next={next} />
      </div>
    </Container>
  );
}
