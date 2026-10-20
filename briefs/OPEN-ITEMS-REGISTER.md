# Open items register — Absolute Catering Supplies

Last updated: 2026-10-20 · Open: 33 · Blocked: 3

## Open

| # | Item | Owner | Raised | Status | Notes |
|---|------|-------|--------|--------|-------|
| 2 | Hosting/retainer figure | Alex | 2026-10-20 | Waiting | Keep off all client-facing pages until confirmed |
| 3 | Product data sheet (due 16 Oct): no sign of it in Drive or email | Client | 2026-10-20 | Blocked | Gates launch: price, pack size, VAT, sell-online, allergens. Alex pushing client; launch asap with what arrives |
| 4 | Allergen + ingredients data with named written sign-off | Client | 2026-10-20 | Blocked | Legal requirement before any product is sold online |
| 5 | Product photography (Drive folder empty as of 20 Oct 19:10) | Client | 2026-10-20 | Waiting | Placeholders keyed by slug; expected from 21 Oct |
| 6 | Download WP media library (114 files, renamed by slug) | Alex | 2026-10-20 | Waiting | Export received 20 Oct. Run `bash scripts/fetch-wp-media.sh` on the Mac (site blocked from Claude's side); then Claude sorts the 24 unsorted files |
| 7 | Delivery slots: days, times, capacity, cut-off, blackout dates | Client | 2026-10-20 | Blocked | Slot engine built configurable; can't go live without values |
| 8 | Collection slots: hours, capacity | Client | 2026-10-20 | Waiting | |
| 9 | Delivery charge, minimum order, does charge vary by distance | Client | 2026-10-20 | Waiting | |
| 10 | 30-mile straight-line radius incl. ROI for now; Alex asking client about crossing the border | Alex | 2026-10-20 | Decided | Revisit once on screen. Postcodes.io is UK-only, so Eircode lookup needed if ROI delivery stays in |
| 11 | Stripe: new or existing account, business email, who holds it | Client | 2026-10-20 | Waiting | No Stripe connector in session; Alex sets up |
| 13 | Order notifications: recipients and format (email, printed picking list) | Client | 2026-10-20 | Waiting | |
| 14 | Range beyond the 56 online | Alex | 2026-10-20 | Decided | Launch with the 56; range grows on the retainer. Notes: WP pages exist for Ham, Butter, Cheese, Pre Packed Dinners, Chicken Chunks, Food Wrap, Christmas with 0 products; 12 menu links 404 (Drinks, Pasta, Condiments, Cleaning…) |
| 15 | Age-restricted lines (alcohol, energy drinks, lighters, knives)? | Client | 2026-10-20 | Open | Changes checkout and delivery handover |
| 16 | Business legal details: Ltd? company number, registered office, VAT number | Client | 2026-10-20 | Open | Required in footer/T&Cs if Ltd |
| 19 | Supabase project: confirm cost of a new project in phantomdev-sys before creating | Alex | 2026-10-20 | Open | Org already has 5 projects. Migrations written and validated (PGlite, 15 checks); ready to apply once the project exists |
| 21 | Taxonomy clean-up: duplicate Pizza/Sausages (fresh+frozen), Prosecco Glasses under Cutlery, Plastic Cups top-level, Absolute Range as aisle | Alex | 2026-10-20 | Decided | Provisional aisle map in `scripts/seed_from_wp.py`; Absolute Range becomes a brand filter + landing page |
| 22 | Absolute Catering Salmon has no aisle (only in Absolute Range) | Client | 2026-10-20 | Open | Fresh or frozen? |
| 23 | Slug `hanfwers-pork-sausages` vs name "Hanfers Pork Sausages": correct brand spelling | Client | 2026-10-20 | Open | Product URL kept as-is until confirmed |
| 24 | Image rights on current WP screenshots unknown | Client | 2026-10-20 | Open | Treat as dev placeholders only; don't launch with them unless client confirms rights |
| 25 | One WooCommerce price exists (Cooked Pulled Chicken Breast £5.99) | Client | 2026-10-20 | Open | Stored as `legacy_price_pence_unverified`, not used |
| 26 | VAT treatment of delivery charge on mixed zero/standard-rated baskets | Client | 2026-10-20 | Open | Ask their accountant; affects receipts |
| 29 | Order email addresses (e.g. orders@) for sending/receiving order mail via Resend | Alex | 2026-10-20 | Open | Later; domain email is with Google (per Alex), leave existing mailboxes untouched |
| 30 | Gift cards, sweets, fizzy drinks: WP media has gift card and drinks/sweets banners. Sold? | Client | 2026-10-20 | Open | Gift cards would need their own build (not v1) |
| 31 | Share payment explainer with Ciaran and Noel; it asks who picks, no-substitutions at launch, who gets order emails | Alex | 2026-10-20 | Open | Claude Doc "How payment works on your new website" |

| 35 | WP product images have prices/captions baked in (and Gluten Free Turkey Burgers shows a Chicken Kiev) | Alex | 2026-10-20 | Decided | Not used on the new site; neutral placeholders until the Drive packshots arrive |
| 36 | 30-mile radius reaches Derry~Londonderry (27.9 mi), Lisnaskea (27.0), Magherafelt (29.4) | Client | 2026-10-20 | Open | Big area for one van; confirm Ciaran is happy before slots are set |
| 37 | Claude sessions can't push to the repo | Alex | 2026-10-20 | Open | Optional: install the Claude GitHub App on phantomdev-sys. Meanwhile Claude commits locally, Alex pushes |
| 38 | Drafted copy to verify: homepage "from cafés and takeaways to families stocking the freezer", About page | Client | 2026-10-20 | Open | Facts only elsewhere; their own story should replace About |
| 39 | Opening hours | Client | 2026-10-20 | Open | Not shown anywhere until confirmed |
| 40 | 21st.dev components | Alex | 2026-10-20 | Decided | Quantity Stepper (Spectrum UI) chosen for the Phase 3 basket; Product Listing Card used as layout reference for tiles |

| 41 | Demo prices (£1.00, NEXT_PUBLIC_DEMO_PRICES=1) must be OFF in Production | Alex | 2026-10-20 | Open | Set only on Vercel Preview; launch checklist item. Banner shows whenever it's on |
| 42 | Supabase project for accounts/favourites/orders | Alex | 2026-10-20 | Waiting | MCP create was cancelled twice (cost-approval box not shown); Alex creating in dashboard: absolute-catering, eu-west-2 |
| 43 | Stripe test keys in Vercel (Alex's account to start, switch to client's later) | Alex | 2026-10-20 | Open | Names given when checkout is wired |

## Resolved

| # | Item | Resolved | Outcome |
|---|------|----------|---------|
| 0 | Deposit ABS-CAT-WEB160926 (£1,950) | 2026-10-20 | Paid; work clear to proceed |
| 1 | Fee for the custom rebuild | 2026-10-20 | £3,900 stands for this build (showcase project, covered by the retainer); future similar builds scoped accordingly |
| 12 | Newsletter platform | 2026-10-20 | Resend, for newsletter and order emails |
| 20 | DNS cutover vs Noel's email | 2026-10-20 | Email is with Google and wasn't touched in the original build; standard MX check at cutover, no change planned |
| 27 | Account required at checkout? | 2026-10-20 | Yes, like Tesco |
| 28 | Slot booking horizon | 2026-10-20 | Up to 6 days ahead (authorise-then-capture) |
| 32 | Architecture plan | 2026-10-20 | Approved as written; adjust as we go |
| 17 | GitHub repo | 2026-10-20 | Published from VS Code (no gh/brew on the Mac) to slightlymucky by mistake, transferred to `phantomdev-sys/absolute-catering` |
| 33 | Design direction | 2026-10-20 | B · Within 30 Miles, plus A's label treatment on product pages and allergen panel. Logo teal #60C4CA fails on white (2.1:1); deep teal #00747C for interactive |
| 34 | Fontshare fonts | 2026-10-20 | Clash Display + Satoshi variable woff2 self-hosted in public/fonts; FFL licences in docs/fonts (self-hosting for websites permitted) |
| 18 | Vercel project | 2026-10-20 | Imported by Alex: `prj_1VRDG6Pk0evirDnuBHzZLDCBPMI7`, first deploy of 2bd7e79 READY, Standard Protection on |
| 44 | Stock imagery | 2026-10-20 | 5 Adobe Stock images licensed (4 by Claude, 1 by Alex); record in docs/STOCK-LICENCES.md; mood/category slots only |
