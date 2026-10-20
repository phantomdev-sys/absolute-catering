-- Catalogue: products, allergens, images.
--
-- The rule that matters most is in the database, not the app: a product can
-- only be 'live' (on sale) when price, VAT, pack size, ingredients and a named
-- allergen sign-off all exist. The UI cannot sell something the data doesn't
-- support, however it is written later.

create type public.product_status as enum ('awaiting_client', 'ready', 'live', 'withdrawn');
create type public.vat_rate as enum ('zero', 'reduced', 'standard');
create type public.storage_type as enum ('frozen', 'chilled', 'ambient');
create type public.allergen as enum (
  'celery', 'cereals containing gluten', 'crustaceans', 'eggs', 'fish', 'lupin', 'milk',
  'molluscs', 'mustard', 'tree nuts', 'peanuts', 'sesame', 'soya', 'sulphur dioxide and sulphites'
);
create type public.allergen_level as enum ('contains', 'may_contain');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_wc_id integer unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(name) between 1 and 200),
  own_brand boolean not null default false,
  -- WooCommerce category slugs; aisles and shelves are derived from these in
  -- content/taxonomy.ts so the shop structure is reviewed in code.
  legacy_categories text[] not null default '{}',
  price_pence integer check (price_pence > 0),
  vat_rate public.vat_rate,
  pack_size text,
  description text,
  storage public.storage_type,
  ingredients text,
  allergen_signed_off_by text,
  allergen_signed_off_at timestamptz,
  sell_online boolean not null default false,
  status public.product_status not null default 'awaiting_client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint live_requires_complete_data check (
    status <> 'live' or (
      price_pence is not null and vat_rate is not null and pack_size is not null
      and ingredients is not null and allergen_signed_off_by is not null
      and allergen_signed_off_at is not null and sell_online
    )
  )
);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_allergens (
  product_id uuid not null references public.products (id) on delete cascade,
  allergen public.allergen not null,
  level public.allergen_level not null,
  primary key (product_id, allergen)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  kind text not null check (kind in ('front', 'back', 'lifestyle')),
  path text not null,
  is_placeholder boolean not null default false,
  source text,
  created_at timestamptz not null default now(),
  unique (product_id, kind)
);
create index product_images_product_idx on public.product_images (product_id);

-- Staff flag lives on profiles (next migration); this helper is defined here
-- with a forward-compatible body so catalogue policies can use it.
create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff s where s.user_id = (select auth.uid()));
$$;
revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

alter table public.products enable row level security;
alter table public.product_allergens enable row level security;
alter table public.product_images enable row level security;
alter table public.staff enable row level security;

create policy "live products are public" on public.products
  for select to anon, authenticated using (status = 'live');
create policy "staff manage products" on public.products
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "allergens follow product visibility" on public.product_allergens
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'live'));
create policy "staff manage allergens" on public.product_allergens
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "images follow product visibility" on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'live'));
create policy "staff manage images" on public.product_images
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "staff see staff list" on public.staff
  for select to authenticated using ((select public.is_staff()));
