-- Fulfilment: store settings, slot templates, slots, holds.
--
-- Values (days, times, capacity, charges) are data, not code, so the client's
-- answers to register #7-9 are inserts, not a release.

create type public.slot_type as enum ('delivery', 'collection');

create table public.store_settings (
  id smallint primary key default 1 check (id = 1),
  store_postcode text not null default 'BT78 5EJ',
  store_lat double precision not null default 54.606155,
  store_lng double precision not null default -7.324825,
  radius_miles numeric(4, 1) not null default 30,
  min_order_pence integer check (min_order_pence >= 0),
  delivery_charge_pence integer check (delivery_charge_pence >= 0),
  -- Card authorisations last about 7 days; payment is captured at picking, so
  -- nothing may be booked further ahead than this (decision, 20 Oct 2026).
  slot_horizon_days smallint not null default 6 check (slot_horizon_days between 1 and 6),
  hold_minutes smallint not null default 30 check (hold_minutes between 5 and 120),
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (1);
create trigger store_settings_updated_at before update on public.store_settings
  for each row execute function public.set_updated_at();

create table public.slot_templates (
  id uuid primary key default gen_random_uuid(),
  type public.slot_type not null,
  weekday smallint not null check (weekday between 0 and 6), -- 0 = Sunday
  starts time not null,
  ends time not null check (ends > starts),
  capacity smallint not null check (capacity > 0),
  cut_off_hours smallint not null default 12 check (cut_off_hours >= 0),
  active boolean not null default true
);

create table public.blackout_dates (
  date date primary key,
  reason text
);

create table public.slots (
  id uuid primary key default gen_random_uuid(),
  type public.slot_type not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  cut_off_at timestamptz not null,
  capacity smallint not null check (capacity > 0),
  booked smallint not null default 0 check (booked >= 0 and booked <= capacity),
  closed boolean not null default false,
  unique (type, starts_at)
);
create index slots_open_idx on public.slots (type, starts_at) where not closed;

create table public.slot_holds (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.slots (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id) -- one held slot per customer at a time
);
create index slot_holds_slot_idx on public.slot_holds (slot_id, expires_at);

-- Hold a slot for the signed-in customer. Locks the slot row so two people
-- can't take the last space, counts live holds plus bookings, and replaces any
-- hold the customer already had.
create or replace function public.hold_slot(p_slot uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_slot public.slots%rowtype;
  v_held integer;
  v_expires timestamptz;
begin
  if v_uid is null then
    raise exception 'sign in to book a slot' using errcode = '42501';
  end if;

  select * into v_slot from public.slots where id = p_slot for update;
  if not found or v_slot.closed or v_slot.cut_off_at <= now() then
    raise exception 'slot not available' using errcode = 'P0001';
  end if;
  if v_slot.starts_at > now() + make_interval(days => (select slot_horizon_days from public.store_settings where id = 1)) then
    raise exception 'slot too far ahead' using errcode = 'P0001';
  end if;

  select count(*) into v_held from public.slot_holds
   where slot_id = p_slot and expires_at > now() and user_id <> v_uid;
  if v_slot.booked + v_held >= v_slot.capacity then
    raise exception 'slot full' using errcode = 'P0001';
  end if;

  v_expires := now() + make_interval(mins => (select hold_minutes from public.store_settings where id = 1));
  insert into public.slot_holds (slot_id, user_id, expires_at)
  values (p_slot, v_uid, v_expires)
  on conflict (user_id) do update set slot_id = excluded.slot_id, expires_at = excluded.expires_at, created_at = now();
  return v_expires;
end;
$$;
revoke execute on function public.hold_slot(uuid) from public, anon;
grant execute on function public.hold_slot(uuid) to authenticated;

alter table public.store_settings enable row level security;
alter table public.slot_templates enable row level security;
alter table public.blackout_dates enable row level security;
alter table public.slots enable row level security;
alter table public.slot_holds enable row level security;

create policy "settings are public" on public.store_settings for select to anon, authenticated using (true);
create policy "staff update settings" on public.store_settings
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "templates are public" on public.slot_templates for select to anon, authenticated using (active);
create policy "staff manage templates" on public.slot_templates
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "blackouts are public" on public.blackout_dates for select to anon, authenticated using (true);
create policy "staff manage blackouts" on public.blackout_dates
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "upcoming open slots are public" on public.slots
  for select to anon, authenticated using (not closed and starts_at > now());
create policy "staff manage slots" on public.slots
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "own holds" on public.slot_holds
  for select to authenticated using (user_id = (select auth.uid()));
