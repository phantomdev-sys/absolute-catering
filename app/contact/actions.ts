'use server';

/**
 * Contact form handler — a deliberate stub.
 *
 * The destination is a project decision from the brief (an inbox, a CRM, a
 * Supabase table), and getting it wrong is worse than not wiring it up:
 * a form that silently posts nowhere looks like it works. So this returns a
 * clear error until someone connects it, and the open items register carries
 * "confirm the contact form destination" until they do.
 *
 * When wiring it up, remember the retention period — the privacy notice has to
 * state how long enquiries are kept.
 */

export type ContactState = { status: 'idle' | 'ok' | 'error'; message: string };

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: a field hidden from people and irresistible to naive bots.
  // Cheap, sets no cookies, and needs no third-party script.
  if (formData.get('company')) {
    return { status: 'ok', message: 'Thank you — we’ll be in touch.' };
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (!name || !email || !message) {
    return { status: 'error', message: 'Please fill in your name, email address and message.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 'error', message: 'That email address doesn’t look right.' };
  }

  if (!process.env.CONTACT_FORM_TO) {
    return {
      status: 'error',
      message:
        'This form isn’t connected yet. Set CONTACT_FORM_TO and wire up a delivery method before launch.',
    };
  }

  // TODO(project): deliver the enquiry — email, CRM, or a Supabase insert.
  return { status: 'ok', message: 'Thank you — we’ll be in touch.' };
}
