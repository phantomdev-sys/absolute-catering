'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { serverClient } from '@/lib/supabase/server';
import { siteOrigin } from '@/lib/origin';
import { adminClient } from '@/lib/supabase/admin';
import { checkPostcode } from '@/lib/delivery';

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

/** Name and phone. Email changes go through Supabase's own confirmation flow, so they're not here. */
export async function updateDetails(_: FormState, form: FormData): Promise<FormState> {
  const supabase = await serverClient();
  if (!supabase) return { error: 'Accounts aren’t switched on yet.' };
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: 'Please sign in again.' };
  const fullName = String(form.get('full_name') ?? '').trim();
  const phone = String(form.get('phone') ?? '').trim();
  if (fullName.length < 2) return { error: 'Please tell us your name.' };
  if (phone && !/^[+()\d\s-]{7,20}$/.test(phone)) return { error: 'That phone number doesn’t look right.' };
  const { error } = await supabase.from('profiles').update({ full_name: fullName, phone: phone || null }).eq('id', data.user.id);
  if (error) return { error: 'We couldn’t save your details. Please try again.' };
  revalidatePath('/account');
  return { notice: 'Your details are saved.' };
}

/**
 * Add a saved address. Delivery eligibility is worked out here from the
 * postcode (never trusted from the browser) and written with the service role,
 * as the addresses table only lets customers read and delete their own rows.
 */
export async function addAddress(_: FormState, form: FormData): Promise<FormState> {
  const supabase = await serverClient();
  const admin = adminClient();
  if (!supabase || !admin) return { error: 'Saved addresses aren’t switched on yet.' };
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: 'Please sign in again.' };
  const line1 = String(form.get('line1') ?? '').trim();
  const line2 = String(form.get('line2') ?? '').trim();
  const town = String(form.get('town') ?? '').trim();
  const label = String(form.get('label') ?? '').trim();
  if (!line1 || !town) return { error: 'Please fill in the first line of the address and the town.' };
  const check = await checkPostcode(String(form.get('postcode') ?? ''));
  if (check.kind === 'invalid') return { error: 'Please enter a full UK postcode, like BT78 5EJ.' };
  if (check.kind === 'not-found') return { error: `We couldn’t find ${check.postcode}. Please check it.` };
  if (check.kind !== 'ok') return { error: 'We couldn’t check that postcode just now. Please try again.' };

  const { count } = await admin.from('addresses').select('id', { count: 'exact', head: true }).eq('user_id', data.user.id);
  const first = (count ?? 0) === 0;
  const { error } = await admin.from('addresses').insert({
    user_id: data.user.id,
    label: label || null,
    line1,
    line2: line2 || null,
    town,
    postcode: check.postcode,
    lat: check.lat,
    lng: check.lng,
    distance_miles: check.miles,
    delivery_eligible: check.delivers,
    is_default: first,
  });
  if (error) return { error: 'We couldn’t save that address. Please try again.' };
  revalidatePath('/account');
  return {
    notice: check.delivers
      ? `Saved. We deliver to ${check.postcode}, about ${Math.round(check.miles)} miles from the store.`
      : `Saved. ${check.postcode} is about ${Math.round(check.miles)} miles away, outside our delivery area, so orders there are click & collect.`,
  };
}

export async function deleteAddress(form: FormData) {
  const supabase = await serverClient();
  if (!supabase) return;
  const id = String(form.get('id') ?? '');
  // RLS: customers can only delete their own rows.
  await supabase.from('addresses').delete().eq('id', id);
  revalidatePath('/account');
}

export async function makeDefaultAddress(form: FormData) {
  const supabase = await serverClient();
  const admin = adminClient();
  if (!supabase || !admin) return;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  const id = String(form.get('id') ?? '');
  // Clear first: a unique index allows one default per customer.
  await admin.from('addresses').update({ is_default: false }).eq('user_id', data.user.id).eq('is_default', true);
  await admin.from('addresses').update({ is_default: true }).eq('user_id', data.user.id).eq('id', id);
  revalidatePath('/account');
}
