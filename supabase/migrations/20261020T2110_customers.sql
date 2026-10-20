-- Customers: profiles, saved addresses, postcode cache.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- A profile row for every new account, so the app never has to handle "signed
-- in but no profile".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text,
  line1 text not null,
  line2 text,
  town text not null,
  postcode text not null,
  lat double precision,
  lng double precision,
  -- Written by the server after a postcodes.io lookup, never by the browser.
  distance_miles numeric(5, 1),
  delivery_eligible boolean,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_user_idx on public.addresses (user_id);
create unique index addresses_one_default on public.addresses (user_id) where is_default;

-- Service-role only: no policies, so anon and authenticated can't read it.
create table public.postcode_cache (
  postcode text primary key,
  lat double precision not null,
  lng double precision not null,
  district text,
  fetched_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.postcode_cache enable row level security;

create policy "own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "staff read profiles" on public.profiles
  for select to authenticated using ((select public.is_staff()));

create policy "own addresses" on public.addresses
  for select to authenticated using (user_id = (select auth.uid()));
-- Eligibility columns are server-written; customers may only edit the address
-- text. Inserts and updates go through a server action using the service role.
create policy "delete own addresses" on public.addresses
  for delete to authenticated using (user_id = (select auth.uid()));
