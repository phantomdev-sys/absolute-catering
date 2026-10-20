'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signIn, signUp, type FormState } from '@/app/account/actions';

const input = 'mt-1 block min-h-11 w-full rounded-md border border-line-strong bg-ground px-3';
const label = 'block text-sm font-semibold';

function Message({ state }: { state: FormState }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-md border-l-4 border-notice-line bg-notice p-3 text-sm">
        {state.error}
      </p>
    );
  if (state.notice)
    return (
      <p role="status" className="rounded-md border-l-4 border-accent bg-teal-soft p-3 text-sm">
        {state.notice}
      </p>
    );
  return null;
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? 'Please wait…' : children}
    </button>
  );
}

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <Message state={state} />
      <div>
        <label htmlFor="email" className={label}>Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className={label}>Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      <Submit pending={pending}>Sign in</Submit>
      <p className="text-sm text-ink-muted">
        New here?{' '}
        <Link href={`/account/sign-up?next=${encodeURIComponent(next)}`} className="font-semibold text-accent underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signUp, {});
  if (state.notice) return <Message state={state} />;
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <Message state={state} />
      <div>
        <label htmlFor="full_name" className={label}>Your name</label>
        <input id="full_name" name="full_name" autoComplete="name" required className={input} />
      </div>
      <div>
        <label htmlFor="email" className={label}>Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className={label}>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          aria-describedby="password-hint"
          className={input}
        />
        <p id="password-hint" className="mt-1 text-sm text-ink-muted">At least 8 characters.</p>
      </div>
      {/* Unticked by default: marketing consent has to be given, not assumed. */}
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="marketing" className="mt-0.5 size-5 accent-accent" />
        <span>Send me offers and news from Absolute Catering Supplies by email. You can stop these at any time.</span>
      </label>
      <Submit pending={pending}>Create account</Submit>
      <p className="text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href={`/account/sign-in?next=${encodeURIComponent(next)}`} className="font-semibold text-accent underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
