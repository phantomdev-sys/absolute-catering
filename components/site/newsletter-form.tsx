'use client';

import { useActionState } from 'react';
import { subscribe } from '@/lib/actions/newsletter';

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, {});
  if (state.ok) {
    return (
      <p role="status" className="font-semibold text-teal">
        Thanks. We’ll email you to confirm before sending anything.
      </p>
    );
  }
  return (
    <form action={action} className="max-w-md">
      <label htmlFor="newsletter-email" className="mb-2 block font-semibold text-teal">
        Offers and new lines, by email
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="min-h-11 w-full min-w-0 flex-1 rounded-md border border-ink-inverse/50 bg-ground px-3 text-ink"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 shrink-0 rounded-md bg-teal px-4 font-semibold text-ink hover:opacity-90 focus-visible:outline-focus-inverse disabled:opacity-60"
        >
          Sign up
        </button>
      </div>
      {state.error && <p role="alert" className="mt-2 text-sm">{state.error}</p>}
      <p className="mt-2 text-xs opacity-90">No spam. Unsubscribe any time.</p>
    </form>
  );
}
