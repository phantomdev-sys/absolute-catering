'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { serverClient } from '@/lib/supabase/server';
import { siteOrigin } from '@/lib/origin';

export type FormState = { error?: string; notice?: string };

// Only ever send people back to a path on this site.
function safeNext(raw: FormDataEntryValue | null): string {
  const v = typeof raw === 'string' ? raw : '';
  return v.startsWith('/') && !v.startsWith('//') ? v : '/account';
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const supabase = await serverClient();
  if (!supabase) return { error: 'Accounts aren’t switched on yet.' };
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error: /confirm/i.test(error.message)
        ? 'Please confirm your email address first. Check your inbox for the link we sent.'
        : 'That email and password don’t match an account.',
    };
  }
  redirect(safeNext(form.get('next')));
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const supabase = await serverClient();
  if (!supabase) return { error: 'Accounts aren’t switched on yet.' };
  const fullName = String(form.get('full_name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const marketing = form.get('marketing') === 'on';
  const next = safeNext(form.get('next'));
  if (fullName.length < 2) return { error: 'Please tell us your name.' };
  if (password.length < 8) return { error: 'Your password needs at least 8 characters.' };

  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: error.message };

  // Consent is recorded only when the box was ticked, with the time it was given.
  if (marketing && data.user && data.session) {
    await supabase
      .from('profiles')
      .update({ marketing_consent: true, marketing_consent_at: new Date().toISOString() })
      .eq('id', data.user.id);
  }

  if (data.session) redirect(next);
  return { notice: `Nearly there. We’ve sent a confirmation link to ${email}. Open it to finish creating your account.` };
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase?.auth.signOut();
  redirect('/');
}

export async function setMarketing(form: FormData) {
  const supabase = await serverClient();
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  const on = form.get('marketing') === 'on';
  await supabase
    .from('profiles')
    .update({ marketing_consent: on, marketing_consent_at: on ? new Date().toISOString() : null })
    .eq('id', data.user.id);
  revalidatePath('/account');
}
