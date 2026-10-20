'use server';

import { adminClient } from '@/lib/supabase/admin';

export type NewsletterState = { ok?: boolean; error?: string };

/**
 * Stores the address as unconfirmed. It only becomes a subscriber when the
 * confirmation email (Resend, register #12) is clicked: double opt-in, which
 * is what PECR expects for marketing email.
 */
export async function subscribe(_: NewsletterState, form: FormData): Promise<NewsletterState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
  const admin = adminClient();
  if (!admin) return { error: 'Sign-ups aren’t switched on yet.' };
  const { error } = await admin
    .from('newsletter_subscribers')
    .upsert({ email, source: 'footer' }, { onConflict: 'email', ignoreDuplicates: true });
  return error ? { error: 'Something went wrong. Please try again.' } : { ok: true };
}
