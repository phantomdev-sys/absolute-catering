'use client';

import { useActionState } from 'react';
import { advanceAction, type StaffState } from '@/app/staff/actions';

/** One-tap status step after charging (out for delivery, delivered, collected). */
export function AdvanceButton({ orderId, to, label, secondary }: { orderId: string; to: string; label: string; secondary?: boolean }) {
  const [state, action, pending] = useActionState<StaffState, FormData>(advanceAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="to" value={to} />
      <button
        type="submit"
        disabled={pending}
        className={
          secondary
            ? 'inline-flex min-h-11 items-center rounded-md border border-line-strong px-5 font-semibold hover:border-ink disabled:opacity-60'
            : 'inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60'
        }
      >
        {pending ? 'Saving…' : label}
      </button>
      {state.error && <p role="alert" className="text-sm">{state.error}</p>}
    </form>
  );
}
