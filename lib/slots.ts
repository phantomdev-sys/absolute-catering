import 'server-only';
import { adminClient } from '@/lib/supabase/admin';

export type Slot = {
  id: string;
  type: 'delivery' | 'collection';
  startsAt: string;
  endsAt: string;
  left: number;
};

/**
 * Bookable slots for the next few days. Tops up the slot table from the
 * templates first (cheap and idempotent), then counts live holds so "x left"
 * reflects people part-way through checkout too.
 */
export async function bookableSlots(): Promise<{ slots: Slot[]; demo: boolean }> {
  const admin = adminClient();
  if (!admin) return { slots: [], demo: false };
  await admin.rpc('generate_slots');

  const nowIso = new Date().toISOString();
  const [{ data: slots }, { data: holds }, { data: demoTemplates }] = await Promise.all([
    admin
      .from('slots')
      .select('id, type, starts_at, ends_at, capacity, booked, cut_off_at')
      .eq('closed', false)
      .gt('cut_off_at', nowIso)
      .order('starts_at'),
    admin.from('slot_holds').select('slot_id').gt('expires_at', nowIso),
    admin.from('slot_templates').select('id').eq('is_demo', true).eq('active', true).limit(1),
  ]);

  const held = new Map<string, number>();
  for (const h of holds ?? []) held.set(h.slot_id, (held.get(h.slot_id) ?? 0) + 1);

  return {
    demo: (demoTemplates ?? []).length > 0,
    slots: (slots ?? []).map((s) => ({
      id: s.id,
      type: s.type,
      startsAt: s.starts_at,
      endsAt: s.ends_at,
      left: Math.max(0, s.capacity - s.booked - (held.get(s.id) ?? 0)),
    })),
  };
}
