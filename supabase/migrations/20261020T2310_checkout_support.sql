-- Checkout support: slot generation, booking confirmation, Stripe session id,
-- unknown VAT on demo orders, and demo slot templates.

-- VAT per product isn't known yet (register #26). A demo order must not invent
-- a rate, so an order line's VAT may be unknown until real data exists.
alter table public.order_items alter column vat_rate drop not null;

alter table public.orders add column stripe_checkout_session_id text unique;

-- Demo templates are flagged so they can never be mistaken for the client's
-- real delivery and collection times, and can be cleared in one statement.
alter table public.slot_templates add column is_demo boolean not null default false;

-- Create bookable slots from active templates for today plus the horizon.
-- Times are Europe/London wall-clock, so slots stay put across the clocks
-- changing. Re-runnable: existing slots are left alone.
create or replace function public.generate_slots()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_days smallint := (select slot_horizon_days from public.store_settings where id = 1);
  v_count integer;
begin
  insert into public.slots (type, starts_at, ends_at, cut_off_at, capacity)
  select t.type,
         (d::date + t.starts) at time zone 'Europe/London',
         (d::date + t.ends) at time zone 'Europe/London',
         ((d::date + t.starts) at time zone 'Europe/London') - make_interval(hours => t.cut_off_hours),
         t.capacity
    from public.slot_templates t
    cross join generate_series(current_date, current_date + v_days, interval '1 day') d
   where t.active
     and extract(dow from d) = t.weekday
     and not exists (select 1 from public.blackout_dates b where b.date = d::date)
  on conflict (type, starts_at) do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke execute on function public.generate_slots() from public, anon, authenticated;

-- Called by the server once Stripe has authorised payment: books the slot and
-- releases the customer's hold in one step. Refuses rather than overbooks.
create or replace function public.confirm_slot_booking(p_slot uuid, p_user uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.slots set booked = booked + 1
   where id = p_slot and booked < capacity;
  if not found then
    return false;
  end if;
  delete from public.slot_holds where user_id = p_user;
  return true;
end;
$$;
revoke execute on function public.confirm_slot_booking(uuid, uuid) from public, anon, authenticated;

-- DEMO ONLY (is_demo = true): placeholder times so checkout can be shown before
-- the client confirms real slots (register #7, #8). Remove with:
--   delete from public.slot_templates where is_demo;
insert into public.slot_templates (type, weekday, starts, ends, capacity, cut_off_hours, is_demo)
select 'delivery'::public.slot_type, wd, s.starts, s.ends, 6, 12, true
  from generate_series(1, 6) wd
 cross join (values (time '10:00', time '12:00'), (time '14:00', time '16:00')) s(starts, ends)
union all
select 'collection'::public.slot_type, wd, s.starts, s.ends, 10, 2, true
  from generate_series(1, 6) wd
 cross join (values (time '09:00', time '11:00'), (time '11:00', time '13:00'), (time '14:00', time '16:00')) s(starts, ends);
