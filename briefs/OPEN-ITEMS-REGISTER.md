# Open items register — Absolute Catering Supplies

Last updated: 2026-10-20 · Open: 28 · Blocked: 3

## Open

| # | Item | Owner | Raised | Status | Notes |
|---|------|-------|--------|--------|-------|
| 1 | Confirm fee for custom rebuild vs the £3,900 Woo quote (brief §5) | Alex | 2026-10-20 | Open | Deposit covers the quoted scope; agree a variation before Phase 3 work exceeds it |
| 2 | Hosting/retainer figure | Alex | 2026-10-20 | Waiting | Keep off all client-facing pages until confirmed |
| 3 | Product data sheet (due 16 Oct): no sign of it in Drive or email | Client | 2026-10-20 | Blocked | Gates launch: price, pack size, VAT, sell-online, allergens. Check WhatsApp |
| 4 | Allergen + ingredients data with named written sign-off | Client | 2026-10-20 | Blocked | Legal requirement before any product is sold online |
| 5 | Product photography (Drive folder empty as of 20 Oct 19:10) | Client | 2026-10-20 | Waiting | Placeholders keyed by slug; expected from 21 Oct |
| 6 | WP media library + WooCommerce CSV export | Alex | 2026-10-20 | Open | Store API scrape covers names/cats/URLs; media needed so images survive DNS cutover |
| 7 | Delivery slots: days, times, capacity, cut-off, blackout dates | Client | 2026-10-20 | Blocked | Slot engine built configurable; can't go live without values |
| 8 | Collection slots: hours, capacity | Client | 2026-10-20 | Waiting | |
| 9 | Delivery charge, minimum order, does charge vary by distance | Client | 2026-10-20 | Waiting | |
| 10 | 30-mile radius: straight line vs driving; does it include ROI addresses? | Client | 2026-10-20 | Open | 30 mi straight line from Omagh crosses into Donegal/Monaghan. Recommend BT postcodes only, ROI = collect |
| 11 | Stripe: new or existing account, business email, who holds it | Client | 2026-10-20 | Waiting | No Stripe connector in session; Alex sets up |
| 12 | Newsletter platform (Resend / Mailchimp / Colabr8) | Alex | 2026-10-20 | Open | Recommend Resend (also does order emails) |
| 13 | Order notifications: recipients and format (email, printed picking list) | Client | 2026-10-20 | Waiting | |
| 14 | Full range size vs 56 online; is 120 cap right? | Client | 2026-10-20 | Waiting | WP pages exist for Ham, Butter, Cheese, Pre Packed Dinners, Chicken Chunks, Food Wrap, Christmas with 0 products; 12 menu links 404 (Drinks, Pasta, Condiments, Cleaning…) |
| 15 | Age-restricted lines (alcohol, energy drinks, lighters, knives)? | Client | 2026-10-20 | Open | Changes checkout and delivery handover |
| 16 | Business legal details: Ltd? company number, registered office, VAT number | Client | 2026-10-20 | Open | Required in footer/T&Cs if Ltd |
| 17 | GitHub repo creation (sandbox can't create) | Alex | 2026-10-20 | Open | `gh repo create phantomdev-sys/absolute-catering --private --source=. --push` |
| 18 | Vercel project import (connector is read-only) | Alex | 2026-10-20 | Open | Import via dashboard after #17, paste project ID into CLAUDE.md |
| 19 | Supabase project: confirm cost of a new project in phantomdev-sys before creating | Alex | 2026-10-20 | Open | Org already has 5 projects |
| 20 | DNS cutover must preserve MX records (noel@ email on this domain) | Alex | 2026-10-20 | Open | Record current DNS before any change |
| 21 | Taxonomy clean-up: duplicate Pizza/Sausages (fresh+frozen), Prosecco Glasses under Cutlery, Plastic Cups top-level, Absolute Range as aisle | Alex | 2026-10-20 | Decided | Provisional aisle map in `scripts/seed_from_wp.py`; Absolute Range becomes a brand filter + landing page |
| 22 | Absolute Catering Salmon has no aisle (only in Absolute Range) | Client | 2026-10-20 | Open | Fresh or frozen? |
| 23 | Slug `hanfwers-pork-sausages` vs name "Hanfers Pork Sausages": correct brand spelling | Client | 2026-10-20 | Open | Product URL kept as-is until confirmed |
| 24 | Image rights on current WP screenshots unknown | Client | 2026-10-20 | Open | Treat as dev placeholders only; don't launch with them unless client confirms rights |
| 25 | One WooCommerce price exists (Cooked Pulled Chicken Breast £5.99) | Client | 2026-10-20 | Open | Stored as `legacy_price_pence_unverified`, not used |
| 26 | VAT treatment of delivery charge on mixed zero/standard-rated baskets | Client | 2026-10-20 | Open | Ask their accountant; affects receipts |
| 27 | Account required at checkout vs guest checkout | Alex | 2026-10-20 | Open | See plan §6 |
| 28 | Slot booking horizon ≤ 6 days if using authorise-then-capture | Alex | 2026-10-20 | Open | See plan §5 |

## Resolved

| # | Item | Resolved | Outcome |
|---|------|----------|---------|
| 0 | Deposit ABS-CAT-WEB160926 (£1,950) | 2026-10-20 | Paid; work clear to proceed |
