-- Explicit Data API grants.
--
-- From 30 Oct 2026 Supabase no longer grants API roles access to new tables in
-- public automatically. That includes every table created when these
-- migrations are replayed (new project, preview branch, `supabase db reset`),
-- so the earlier migrations alone would rebuild a database the site can't read.
-- This migration states the grants instead of relying on the old defaults.
--
-- It also narrows them. The defaults gave anon and authenticated every
-- privilege on every table, TRUNCATE included, which RLS does not cover.
-- Row-level access is still decided by the policies; grants only decide
-- whether a role can reach a table at all.

revoke all on all tables in schema public from anon, authenticated;

-- anon: read-only, and only the tables with a public select policy.
grant select on
  public.products,
  public.product_allergens,
  public.product_images,
  public.store_settings,
  public.slot_templates,
  public.blackout_dates,
  public.slots
to anon;

-- authenticated: normal read/write, with RLS deciding which rows.
grant select, insert, update, delete on all tables in schema public to authenticated;

-- service_role: server-side admin client (checkout, orders, newsletter).
grant select, insert, update, delete on all tables in schema public to service_role;
