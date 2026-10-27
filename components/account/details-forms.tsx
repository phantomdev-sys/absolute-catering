'use client';

import { useActionState } from 'react';
import { addAddress, updateDetails, type FormState } from '@/app/account/actions';

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

const button =
  'inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60';

export function DetailsForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, action, pending] = useActionState(updateDetails, {});
  return (
    <form action={action} className="mt-4 space-y-4">
      <Message state={state} />
      <div>
        <label htmlFor="full_name" className={label}>Full name</label>
        <input id="full_name" name="full_name" autoComplete="name" required defaultValue={fullName} className={input} />
      </div>
      <div>
        <label htmlFor="acct-email" className={label}>Email address</label>
        <input id="acct-email" value={email} readOnly aria-describedby="email-hint" className={`${input} bg-ground-subtle text-ink-muted`} />
        <p id="email-hint" className="mt-1 text-xs text-ink-muted">This is the email you sign in with. Call us if you need it changed.</p>
      </div>
      <div>
        <label htmlFor="acct-phone" className={label}>
          Phone <span className="font-normal text-ink-muted">(for the driver)</span>
        </label>
        <input id="acct-phone" name="phone" type="tel" autoComplete="tel" defaultValue={phone} className={input} />
      </div>
      <button type="submit" disabled={pending} className={button}>
        {pending ? 'Saving…' : 'Save details'}
      </button>
    </form>
  );
}

export function AddAddressForm() {
  const [state, action, pending] = useActionState(addAddress, {});
  return (
    <form action={action} className="mt-4 space-y-4">
      <Message state={state} />
      <div>
        <label htmlFor="addr-label" className={label}>
          Name this address <span className="font-normal text-ink-muted">(optional, e.g. Home, The café)</span>
        </label>
        <input id="addr-label" name="label" className={input} />
      </div>
      <div>
        <label htmlFor="addr-line1" className={label}>Address line 1</label>
        <input id="addr-line1" name="line1" autoComplete="address-line1" required className={input} />
      </div>
      <div>
        <label htmlFor="addr-line2" className={label}>
          Address line 2 <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <input id="addr-line2" name="line2" autoComplete="address-line2" className={input} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="addr-town" className={label}>Town</label>
          <input id="addr-town" name="town" autoComplete="address-level2" required className={input} />
        </div>
        <div>
          <label htmlFor="addr-postcode" className={label}>Postcode</label>
          <input id="addr-postcode" name="postcode" autoComplete="postal-code" required className={`${input} uppercase`} />
        </div>
      </div>
      <button type="submit" disabled={pending} className={button}>
        {pending ? 'Checking postcode…' : 'Save address'}
      </button>
    </form>
  );
}
