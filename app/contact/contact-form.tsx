'use client';

import { useActionState } from 'react';
import { submitContact, type ContactState } from './actions';

const initial: ContactState = { status: 'idle', message: '' };

const field =
  'mt-1 w-full rounded-md border border-line-strong bg-ground-raised px-3 py-2 text-ink';

/**
 * The accessibility details here are the ones that get missed, so they're
 * deliberate rather than incidental:
 *
 * · every input has a real <label> tied by id — placeholders are not labels,
 *   they vanish on focus and screen readers treat them inconsistently
 * · the result message is in an aria-live region, so a screen reader user
 *   learns the outcome without having to go hunting for it
 * · the submit button is disabled while pending, with the state announced
 * · the honeypot is hidden from everyone, assistive technology included, and
 *   marked tabIndex={-1} so keyboard users never land in it
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initial);

  return (
    <form action={formAction} className="mt-10 max-w-lg space-y-5">
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Your name
        </label>
        <input id="name" name="name" type="text" autoComplete="name" required className={field} />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={field} />
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea id="message" name="message" rows={5} required className={field} />
      </div>

      <div aria-hidden="true" className="hidden">
        <label htmlFor="company">Company (leave blank)</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-ink hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send message'}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={state.status === 'error' ? 'text-sm text-ink' : 'text-sm text-accent'}
      >
        {state.message}
      </p>
    </form>
  );
}
