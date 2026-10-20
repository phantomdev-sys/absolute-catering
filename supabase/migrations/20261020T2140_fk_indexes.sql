-- Covering indexes for foreign keys flagged by the Supabase performance
-- advisor after the first four migrations (20 Oct 2026).
create index basket_items_product_idx on public.basket_items (product_id);
create index favourites_product_idx on public.favourites (product_id);
create index order_events_actor_idx on public.order_events (actor);
