# Architecture and phased build plan

Status: **approved by Alex, 20 Oct 2026.** Decisions: account required at checkout; 6-day booking horizon; Resend for order email and newsletter; 30-mile straight-line radius including ROI for now (revisit on screen).

## 1. Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 · 21st.dev e-commerce components (shadcn-based, restyled to our tokens) · Supabase (Postgres, Auth, Storage, RLS) · Stripe (Checkout Sessions, embedded, manual capture) · Resend (transactional email + newsletter) · Vercel. Postcode lookup via postcodes.io (free, UK only).

Server Components by default. All money, slot and radius logic is server-side. The browser never decides a price, a slot or eligibility.

## 2. Data model (Postgres)

**Catalogue**
- `products`: id, legacy_wc_id, slug (unique, = URL), name, brand, own_brand, description, pack_size, `price_pence` (inc. VAT, nullable), `vat_rate` (zero / standard / reduced, nullable), `storage` (ambient / chilled / frozen, drives picking and van loading), sell_online, `data_status` (awaiting_client / ready / live / withdrawn), search vector.
- `product_allergens`: product_id, allergen (the 14 UK allergens, enum), level (contains / may_contain), plus ingredients text on product, `signed_off_by`, `signed_off_at`, `source_image_id`. **A product can only be `live` if price, VAT, pack size and signed-off allergens exist**, enforced by a DB check/trigger, not by the UI.
- `product_images`: product_id, kind (front / back / lifestyle), storage path, `is_placeholder`, source. Keyed by slug so Drive files `<slug>-front.jpg` import by script.
- `categories` (aisle → shelf tree), `product_categories` (many-to-many). Dietary/brand facets (gluten free, Absolute Range) are tags, so "Gluten Free" can be both an aisle and a filter.

**Customers**
- `profiles` (1:1 auth.users): name, phone, marketing consent + timestamp.
- `addresses`: line1–3, town, postcode, lat/lng, `distance_miles`, `delivery_eligible`, is_default.
- `postcode_cache`: postcode → lat/lng, looked up once.

**Fulfilment**
- `slot_templates`: type (delivery / collection), weekday, start, end, capacity, cut_off_hours.
- `slots`: concrete date instances generated from templates (nightly job), capacity, booked count, closed flag.
- `blackout_dates`.
- `slot_holds`: slot_id, basket/user, expires_at (e.g. 30 min). Booked through a Postgres function that locks the slot row, so two people can't take the last space.

**Basket and orders**
- `baskets` / `basket_items`: server-side for signed-in users; anonymous basket by signed cookie, merged on sign-in.
- `orders`: number (human-friendly), user, fulfilment type, slot, address snapshot, subtotal, delivery charge, VAT breakdown, total, Stripe PaymentIntent id, `status` (awaiting_payment → authorised → picking → ready / out_for_delivery → completed; cancelled; part_fulfilled).
- `order_items`: snapshot of name, slug, price, VAT rate, qty, `picked_qty`, `unavailable` flag.
- `order_events`: audit trail (status changes, who, when).
- `favourites`: user, product. **Buy again** is a view over the user's past `order_items`, ranked by frequency and recency.

**Marketing and settings**
- `newsletter_subscribers`: email, double opt-in token, confirmed_at, source, unsubscribed_at (synced to Resend Audiences).
- `store_settings`: store lat/lng, radius miles, minimum order, delivery charge rules, slot horizon. One row, editable by staff.

RLS: customers see only their own rows; catalogue is public read for `live` products; staff role for admin; service role only in server actions and webhooks.

## 3. 30-mile radius check

1. Customer enters a postcode (homepage "Check delivery" box, and again at address entry).
2. Server looks it up in `postcode_cache`, else postcodes.io; stores lat/lng.
3. Haversine distance from the store's coordinates (BT78 5EJ). ≤ radius → delivery slots offered. > radius or unknown → "We can't deliver to you yet, but you can still order for collection" and collection slots only.
4. Postcodes within ~2 miles of the boundary are flagged on the order for a human to sanity-check on the first few weeks.

**Where the brief doesn't hold up:** 30 miles straight-line from Omagh reaches into Donegal and Monaghan. postcodes.io doesn't cover Eircodes, and cross-border delivery raises VAT, currency and address questions. Recommendation: delivery to BT postcodes only, ROI customers collect. **Decision (20 Oct):** keep the full 30-mile radius for now, ROI included; Alex is asking whether the van can cross the border. If ROI stays in, add an Eircode lookup alongside postcodes.io. Straight-line also under-reads rural driving distance, which is fine for v1 but worth stating to the client.

## 4. Slots

Delivery and click-and-collect use the same engine with different templates. Tesco-style grid: days across, time bands down, "x left" when nearly full. A slot is held when chosen and released if checkout isn't completed. Cut-off per slot (e.g. order by 8pm the day before). All values come from `store_settings` / templates, so the client's answers (register #7–9) are data, not code.

## 5. Payments: authorise at checkout, capture at picking

The quote's assumption is "out-of-stocks refunded at picking". Better: Stripe **manual capture**. The card is authorised at checkout; staff pick, mark anything unavailable, and capture only the final amount. No refunds, no fees on refunded lines, and the customer's statement shows the true total.

Constraint: card authorisations expire after about 7 days, so **slots can only be booked up to 6 days ahead** (register #28). If Ciaran wants Tesco-style 3-week booking, the fallback is to save the card at checkout and charge at picking, which carries more SCA failure risk. **Decision (20 Oct):** 6-day horizon at launch. Client explainer: Claude Doc "How payment works".

Stripe webhooks (`checkout.session.completed`, `payment_intent.amount_capturable_updated`, `payment_intent.canceled`) are the only thing that moves an order to `authorised`. Apple Pay and Google Pay come free with Checkout.

## 6. Accounts

Supabase Auth with email + password and magic link. **Decision (20 Oct): account required to check out** (like Tesco). It's needed for order history, buy-again and saved addresses, and keeps slot holds simple. Guests can still browse, build a basket and check delivery eligibility, and create the account at the start of checkout (register #27).

Account area: orders (with status and re-order), addresses, favourites, buy again, marketing preferences, delete account.

## 7. Storefront features ("Tesco-grade" scoped honestly)

In v1: aisle navigation with mega-menu, search with type-ahead, filters (aisle, own brand, gluten free, storage type, allergen-free once data exists), product cards with add-to-basket and quantity stepper in place, sticky mini-basket with running total and minimum-order progress, product page with full allergen/ingredient panel and back-of-pack image, buy again, favourites, delivery checker, slot grid, order tracking statuses, transactional emails, newsletter sign-up with double opt-in.

Not v1 (retainer roadmap): substitution preferences per line, offers/multi-buy pricing, recipes/inspiration, recommendations, stock sync (no EPOS). With 56 products the experience will feel like Tesco's, not do everything Tesco's does. That's the right target.

## 8. Staff admin (the client's side)

Even with Phantom controlling catalogue updates, the shop needs an order back-office from day one: orders grouped by slot, printable picking list (grouped by storage: frozen / chilled / ambient), mark lines unavailable → capture, mark ready / out for delivery / completed (customer emailed), slot capacity and blackout dates, and a simple product price/availability toggle. Catalogue bulk changes go through a CSV import script that Phantom runs.

## 9. URLs and redirects

- Products keep `/product/<slug>`, identical to WooCommerce, so no redirect is needed.
- Categories move to `/shop/<aisle>/<shelf>`. Old `/product-category/...` and the WP "category pages" (`/bacon`, `/chicken`…) 301 per `data/redirects/redirects.csv` (78 rows, generated). Implemented in `next.config` redirects.
- 12 mega-menu links on the current site already 404 (Drinks, Pasta, Condiments, Cleaning Products…). No redirect needed, but they suggest range that isn't online yet (register #14).
- Images must be copied off WordPress before DNS cutover. Hot-linking dies when the domain moves (register #6).

## 10. Compliance (go-live blockers)

Allergens and ingredients before purchase, with sign-off (distance-selling food information rules; Natasha's Law also applies if Absolute Range lines are packed on site, so worth confirming). Per-product VAT. Pages: delivery, click & collect, substitutions & refunds (perishables are exempt from the 14-day cancellation right; say so plainly), privacy, cookies (consent banner, analytics off until accepted), T&Cs, company details in footer (register #16). Newsletter: PECR-compliant opt-in, unticked by default.

## 11. Phases

| Phase | Dates (target) | Delivers | Gate |
|---|---|---|---|
| 0. Setup | 20 Oct ✅ | Repo, scrape, seed, redirect map, register, this plan | Plan approved |
| 1. Design direction | 21–22 Oct | Three directions in words; you pick; palette contrast-checked | Direction chosen |
| 2. Foundations | 22–28 Oct | Scaffold from site-starter, tokens, layout shell, Supabase schema + RLS + seed, catalogue (aisles, listing, product page, search), image pipeline with placeholders, redirects | Browsable catalogue on a Vercel preview |
| 3. Transactional core | 28 Oct–4 Nov | Accounts, addresses + radius check, basket, slots + holds, Stripe test-mode checkout with manual capture, webhooks, order emails | End-to-end test order in Stripe test mode |
| 4. Operations and loyalty | 4–10 Nov | Staff admin, picking list, capture flow, client data import, buy again, favourites, newsletter | Staff can run a full order cycle |
| 5. Hardening and launch | 10–17 Nov | Compliance pages, verification gates (build, lint, axe on every route, screenshots, links, performance), Stripe live, soft launch with limited slots, DNS cutover keeping MX | Balance paid, data signed off, all gates pass |
| 6. Retainer | from launch | Full range, substitutions, offers, real photography rollout | — |

**Timeline risk, stated plainly:** the code can hit mid-November. The launch can't unless the product data (register #3, #4) and slot answers (#7) land by about 3 Nov. No product goes live without signed-off allergens. That's legal, not stylistic. Suggest telling Ciaran now that launch moves with the data.
