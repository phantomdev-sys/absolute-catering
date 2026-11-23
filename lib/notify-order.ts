import 'server-only';
import { adminClient } from '@/lib/supabase/admin';
import { slotText } from '@/lib/picking';

/**
 * "New order" email to the shop, sent once when an order's card is authorised.
 *
 * Decision 23 Nov 2026 (Alex): goes to Noel and Ciaran, plus Alex for the
 * first weeks after launch. Recipients are an environment setting, not code,
 * so Alex comes off the list by editing ORDER_NOTIFY_EMAILS in Vercel:
 *
 *   ORDER_NOTIFY_EMAILS = noel@absolutecateringsupplies.com, ciarancarlin7@gmail.com, alex@phantomdevelopment.uk
 *   ORDER_EMAIL_FROM    = Absolute Catering orders <orders@your-verified-domain>
 *   RESEND_API_KEY      = re_…  (Resend, https://resend.com; the From domain must be verified there)
 *
 * Sent through Resend's HTTP API with fetch (no SDK). If anything is missing
 * or Resend fails, it logs and returns: an email problem must never break a
 * customer's checkout. Staff still see every order on /staff.
 */
export async function notifyNewOrder(orderId: string, origin: string): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ORDER_EMAIL_FROM?.trim();
  const to = (process.env.ORDER_NOTIFY_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!key || !from || to.length === 0) {
    console.warn('[notify-order] not configured (RESEND_API_KEY / ORDER_EMAIL_FROM / ORDER_NOTIFY_EMAILS); skipped');
    return;
  }

  const admin = adminClient();
  if (!admin) return;

  try {
    const { data: order } = await admin
      .from('orders')
      .select('id, number, user_id, fulfilment, address, subtotal_pence, delivery_pence, total_pence, slot:slots(starts_at, ends_at)')
      .eq('id', orderId)
      .maybeSingle();
    if (!order) return;

    const [{ data: items }, { data: profile }, { data: user }] = await Promise.all([
      admin.from('order_items').select('name, qty, price_pence').eq('order_id', orderId).order('name'),
      admin.from('profiles').select('full_name, phone').eq('id', order.user_id).maybeSingle(),
      admin.auth.admin.getUserById(order.user_id),
    ]);

    const slotRow = Array.isArray(order.slot) ? order.slot[0] : order.slot;
    const slot = slotText({ slot: slotRow ? { startsAt: slotRow.starts_at, endsAt: slotRow.ends_at } : null });
    const gbp = (p: number) => `£${(p / 100).toFixed(2)}`;
    const address = order.address as { line1?: string; line2?: string; town?: string; postcode?: string; phone?: string } | null;
    const how = order.fulfilment === 'delivery' ? 'Delivery' : 'Click & collect';
    const customer = profile?.full_name || user?.user?.email || 'Customer';
    const phone = address?.phone || profile?.phone || '';
    const staffLink = `${origin}/staff/orders/${order.number}`;

    const lines = (items ?? []).map((i) => `${i.qty} × ${i.name} (${gbp(i.price_pence)} each)`);
    const where = address
      ? [address.line1, address.line2, address.town, address.postcode].filter(Boolean).join(', ')
      : 'Collect from the store';

    const text = [
      `New order #${order.number}: ${how}, ${slot}`,
      '',
      `Customer: ${customer}`,
      user?.user?.email ? `Email: ${user.user.email}` : '',
      phone ? `Phone: ${phone}` : '',
      `${order.fulfilment === 'delivery' ? 'Deliver to' : 'Fulfilment'}: ${where}`,
      '',
      ...lines,
      '',
      `Subtotal: ${gbp(order.subtotal_pence)}`,
      order.delivery_pence ? `Delivery: ${gbp(order.delivery_pence)}` : '',
      `Total held on card: ${gbp(order.total_pence)}`,
      '',
      'The card is held, not charged. Pick the order, then charge the picked amount on the staff screen:',
      staffLink,
    ]
      .filter((l, i, all) => l !== '' || all[i - 1] !== '')
      .join('\n');

    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1e1622">
<h1 style="font-size:20px;margin:0 0 8px">New order #${order.number}</h1>
<p style="margin:0 0 16px"><strong>${how}</strong>, ${esc(slot)}</p>
<p style="margin:0 0 16px">${esc(customer)}${user?.user?.email ? `<br>${esc(user.user.email)}` : ''}${phone ? `<br>${esc(phone)}` : ''}<br>${esc(where)}</p>
<table style="border-collapse:collapse;margin:0 0 16px">${(items ?? [])
      .map((i) => `<tr><td style="padding:4px 12px 4px 0">${i.qty} ×</td><td style="padding:4px 12px 4px 0">${esc(i.name)}</td><td style="padding:4px 0;text-align:right">${gbp(i.price_pence * i.qty)}</td></tr>`)
      .join('')}</table>
<p style="margin:0 0 16px">Subtotal ${gbp(order.subtotal_pence)}${order.delivery_pence ? ` · Delivery ${gbp(order.delivery_pence)}` : ''}<br><strong>Total held on card: ${gbp(order.total_pence)}</strong></p>
<p style="margin:0 0 16px">The card is held, not charged. Pick the order, then charge the picked amount on the staff screen.</p>
<p><a href="${staffLink}" style="background:#15757a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:bold">Open order #${order.number}</a></p>
</div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject: `New order #${order.number}: ${how}, ${slot}`, text, html }),
    });
    if (!res.ok) console.error('[notify-order] Resend refused', res.status, await res.text());
  } catch (err) {
    console.error('[notify-order] failed', err);
  }
}
