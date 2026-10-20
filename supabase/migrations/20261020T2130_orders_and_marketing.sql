-- Baskets, orders, favourites, buy-again, newsletter.
--
-- Orders are created and moved between states only by the server (service
-- role): checkout creates them, the Stripe webhook marks them authorised, and
-- staff actions capture payment. Customers can read their own; nobody can
-- write one from the browser.

create type public.fulfilment_type as enum ('delivery', 'collection');
create type public.order_status as enum (
  'awaiting_payment', 'authorised', 'picking', 'ready', 'out_for_delivery',
  'completed', 'part_fulfilled', 'cancelled'
);

create table public.baskets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table public.basket_items (
  basket_id uuid not null references public.baskets (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  qty smallint not null check (qty between 1 and 99),
  added_at timestamptz not null default now(),
  primary key (basket_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1001) unique,
  user_id uuid not null references auth.users (id) on delete restrict,
  fulfilment public.fulfilment_type not null,
  slot_id uuid references public.slots (id) on delete restrict,
  -- Snapshot, so editing a saved address never rewrites an order's history.
  address jsonb,
  subtotal_pence integer not null check (subtotal_pence >= 0),
  delivery_pence integer not null default 0 check (delivery_pence >= 0),
  total_pence integer not null check (total_pence >= 0),
  captured_pence integer check (captured_pence >= 0 and captured_pence <= total_pence),
  vat_breakdown jsonb not null default '{}',
  status public.order_status not null default 'awaiting_payment',
  stripe_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint delivery_needs_address check (fulfilment <> 'delivery' or address is not null)
);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_slot_idx on public.orders (slot_id);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  -- Snapshot of what was bought, at the price it was bought at.
  name text not null,
  slug text not null,
  price_pence integer not null check (price_pence >= 0),
  vat_rate public.vat_rate not null,
  qty smallint not null check (qty between 1 and 99),
  picked_qty smallint check (picked_qty between 0 and qty),
  unavailable boolean not null default false
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  status public.order_status not null,
  actor uuid references auth.users (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);
create index order_events_order_idx on public.order_events (order_id, created_at);

create table public.favourites (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- Buy again: what each customer has actually received, most frequent first.
-- security_invoker, so the orders RLS below decides whose rows are visible.
create view public.buy_again with (security_invoker = true) as
select o.user_id,
       oi.product_id,
       count(distinct o.id) as times_bought,
       max(o.created_at) as last_bought_at
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
 where o.status in ('completed', 'part_fulfilled')
   and not oi.unavailable
   and oi.product_id is not null
 group by o.user_id, oi.product_id;

-- Service-role only. Double opt-in: a row is a subscriber once confirmed_at is set.
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and position('@' in email) > 1),
  confirm_token uuid not null default gen_random_uuid(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  source text,
  created_at timestamptz not null default now()
);

alter table public.baskets enable row level security;
alter table public.basket_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.favourites enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "own basket" on public.baskets
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own basket items" on public.basket_items
  for all to authenticated
  using (exists (select 1 from public.baskets b where b.id = basket_id and b.user_id = (select auth.uid())))
  with check (exists (select 1 from public.baskets b where b.id = basket_id and b.user_id = (select auth.uid())));

create policy "own orders" on public.orders
  for select to authenticated using (user_id = (select auth.uid()));
create policy "staff orders" on public.orders
  for select to authenticated using ((select public.is_staff()));

create policy "own order items" on public.order_items
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));
create policy "staff order items" on public.order_items
  for select to authenticated using ((select public.is_staff()));

create policy "own order events" on public.order_events
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));
create policy "staff order events" on public.order_events
  for select to authenticated using ((select public.is_staff()));

create policy "own favourites" on public.favourites
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
