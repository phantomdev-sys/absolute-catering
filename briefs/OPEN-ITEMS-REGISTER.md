# Open items register — Absolute Catering Supplies

Last updated: 2026-10-29 · Open: 34 · Blocked: 3

## Open

| # | Item | Owner | Raised | Status | Notes |
|---|------|-------|--------|--------|-------|
| 2 | Hosting/retainer figure | Alex | 2026-10-20 | Waiting | Keep off all client-facing pages until confirmed |
| 3 | Product data sheet (due 16 Oct): no sign of it in Drive or email | Client | 2026-10-20 | Blocked | Gates launch: price, pack size, VAT, sell-online, allergens. Alex pushing client; launch asap with what arrives |
| 4 | Allergen + ingredients data with named written sign-off | Client | 2026-10-20 | Blocked | Legal requirement before any product is sold online |
| 6 | Download WP media library (114 files, renamed by slug) | Alex | 2026-10-20 | Waiting | Export received 20 Oct. Run `bash scripts/fetch-wp-media.sh` on the Mac (site blocked from Claude's side); then Claude sorts the 24 unsorted files |
| 7 | Delivery slots: days, times, capacity, cut-off, blackout dates | Client | 2026-10-20 | Blocked | Slot engine built configurable; can't go live without values |
| 8 | Collection slots: hours, capacity | Client | 2026-10-20 | Waiting | |
| 10 | 30-mile straight-line radius incl. ROI for now; Alex asking client about crossing the border | Alex | 2026-10-20 | Decided | Revisit once on screen. Postcodes.io is UK-only, so Eircode lookup needed if ROI delivery stays in |
| 11 | Stripe: new or existing account, business email, who holds it | Client | 2026-10-20 | Waiting | No Stripe connector in session; Alex sets up |
| 13 | Order notifications: recipients and format (email, printed picking list) | Client | 2026-10-20 | Waiting | |
| 14 | Range beyond the 56 online | Alex | 2026-10-20 | Decided | Launch with the 56; range grows on the retainer. Notes: WP pages exist for Ham, Butter, Cheese, Pre Packed Dinners, Chicken Chunks, Food Wrap, Christmas with 0 products; 12 menu links 404 (Drinks, Pasta, Condiments, Cleaning…) |
| 15 | Age-restricted lines (alcohol, energy drinks, lighters, knives)? | Client | 2026-10-20 | Open | Changes checkout and delivery handover |
| 16 | Business legal details: Ltd? company number, registered office, VAT number | Client | 2026-10-20 | Open | Required in footer/T&Cs if Ltd |
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

| 45 | Demo slot templates (is_demo) in the database: Mon–Sat delivery 10–12/2–4, collection 9–11/11–1/2–4 | Client | 2026-10-20 | Open | Replace with real slots (#7, #8): `delete from slot_templates where is_demo;` |
| 46 | Stripe webhook (order confirmation if the customer closes the tab after paying) | Alex | 2026-10-20 | Open | Needs a Vercel protection bypass for /api/stripe/webhook; success page confirms orders meanwhile |
| 47 | Staff order screen: picking list, mark unavailable, capture payment | Alex | 2026-10-20 | Built 29 Oct, awaiting end-to-end test | `/staff`: list by slot, pick with steppers, two-step "charge £X" captures picked items + delivery via Stripe, or cancels and releases the hold; printable picking list; status steps to delivered/collected. Staff = rows in `public.staff`. Needs a test-mode order run on Vercel before launch |
| 57 | Short picks: does the £5 delivery charge still apply when items are unavailable? | Client | 2026-10-29 | Waiting | Built as: charged if anything is delivered; nothing charged if nothing is picked. One line in `lib/picking.ts` to change |
| 48 | Resend: confirmation email for newsletter double opt-in, order emails | Alex | 2026-10-20 | Open | Newsletter sign-ups stored unconfirmed until then |

| 51 | 5 photo products may duplicate, or be flavour/size variants of, old-site products | Client | 2026-10-26 | Open | In info-needed.csv; if variants, consider one product with options |
| 55 | Before the public domain goes live: catalogue switches to live-only once a product is live in Supabase; DB `live_requires_complete_data` still needs signed-off allergens to sell | Alex | 2026-10-26 | Open | Decision: everything shows on the site now; information is completed before the domain cutover |
| 56 | Tell Ciaran we've used pack/sticker prices; send him the info-needed sheet | Alex | 2026-10-26 | Waiting | Sent 27 Oct; sheet is link-editable and Ciaran has passed it to staff (29 Oct) |
| 49 | Pack-photo text (ingredients, allergy advice) is a Claude transcription, unchecked | Client | 2026-10-26 | Open | Shown on product pages as "from the pack photo" under a disclaimer (decision: missing info must not keep products off the site). Needs checking + named sign-off; `data/pack-labels/info-needed.csv` is the to-do list |
| 52 | 8 Rosie & Jim back-of-pack photos are identical brand panels with no product name | Client | 2026-10-26 | Open | 29 Oct: Ciaran named them; 4 attached (burgers, battered nuggets, salt & chilli shredded, GF turkey burgers), the wrong back removed from GF salt & chilli. 3 still unnamed. Ingredients-panel photos still wanted |
| 53 | 45 old-site products still have no photo; 3 cutouts worth a reshoot (AIA wings, Steak Crunch n Seal tub, Vista Popcorn Chicken) | Client | 2026-10-26 | Open | Placeholders sort after photographed products on every shelf. 29 Oct: Noel's "Steak Crispy Onions" upload is a duplicate of the 75g photo; 1kg tub retake still needed. Also asked: are the cup photos one product or two |

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
| 19 | Supabase project | 2026-10-20 | Created by Alex in the dashboard: `zlzdjentqmjjnxmojtko` (eu-west-1, Ireland, not London; fine for NI) |
| 42 | Schema applied | 2026-10-20 | 5 migrations applied, 56 products seeded as awaiting_client; advisors: security flags intentional, FK indexes added |
| 5 | Product photography | 2026-10-26 | 112 photos from Ciaran (23 Oct): 79 products now have packshots on white (68 new products + 11 old-site ones), all 124 in Supabase as awaiting_client |
| 50 | Price stickers in photos | 2026-10-26 | Run with prices printed on pack/sticker (29 products, `data/pack-labels/prices.json`); Ciaran to be told (#56) |
| 54 | Product cap | 2026-10-26 | No cap for now; upload whatever the client sends |
| 9 | Delivery charge and minimum order | 2026-10-27 | £5 delivery, £50 minimum spend for delivery (items total); click & collect free, no minimum. Enforced at checkout; `content/delivery.ts` + `store_settings`. VAT on the charge still #26 |
| 43 | Stripe test keys | 2026-10-20 | Alex's own new 'Absolute Catering Supplies' Stripe account, sandbox keys added to Vercel |
