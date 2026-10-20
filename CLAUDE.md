# Absolute Catering Supplies — e-commerce rebuild

British English throughout: site copy, comments, commits.

## Disambiguation
- **Client:** Absolute Catering Supplies, 23D Gortrush Industrial Estate, Omagh, BT78 5EJ. A local food wholesale/retail outlet. Owner Noel Carlin (payments, `noel@` — NOT `neol@`), son Ciaran (day-to-day decisions, WhatsApp).
- **Domain:** absolutecateringsupplies.com (live WP/WooCommerce catalogue site, built by Phantom in Nov 2025).
- Not to be confused with any other "Absolute Catering" business. Only this domain and this address.

## Working directory
`/Users/Dad/Desktop/Website Builds/absolute-catering`. Never read or write outside it without asking.

## Pinned identifiers
| Platform | Identifier |
|---|---|
| Supabase org | phantomdev-sys (`tniqszshwsqrjsvxaxlb`) |
| Supabase project | `absolute-catering` · ref `zlzdjentqmjjnxmojtko` · eu-west-1 (Ireland) · created by Alex 20 Oct 2026 |
| Vercel team | phantom-dev1 (`team_HqP6SQwx4jkuTVYNACgBcyyI`) |
| Vercel project | `absolute-catering` · `prj_1VRDG6Pk0evirDnuBHzZLDCBPMI7` · absolute-catering.vercel.app (Standard Protection: Vercel login required) |
| GitHub repo | `phantomdev-sys/absolute-catering` (private). Never `slightlymucky`, an old account Alex no longer uses |
| Stripe account | Alex's 'Absolute Catering Supplies' account, **sandbox/test keys only** while demo prices are on |

Existing Supabase projects in the org that this build must NEVER touch: bowery-intelligence, Emberbox, mcn-painting, jordan-victory-church, yuutani-crm.

## Hard rules
- Never invent allergen, ingredient, price, VAT or pack-size data. Null + `data_status` until the client supplies it; allergens need a named person's written sign-off.
- No Phantom fees (hosting, retainer, build) on any client-facing page or document — figure still TBC.
- Product images are keyed by product slug so Drive photos (`<slug>-front.jpg`, `<slug>-back.jpg`) drop in without code changes.
- Product URLs stay `/product/<slug>` (identical to WooCommerce). Category and page URLs 301 per `data/redirects/redirects.csv`.
- Never publish to production before the balance invoice is paid.

## Key files
- `briefs/ABSOLUTE-CATERING-BRIEF.md`: source of truth for scope.
- `briefs/OPEN-ITEMS-REGISTER.md`: read first every session.
- `docs/ARCHITECTURE-PLAN.md`: architecture and phases (approved 20 Oct 2026).
- `docs/DESIGN-DIRECTIONS.md`: chosen direction (B · Within 30 Miles + A's label treatment) and the measured palette.
- `content/taxonomy.ts`: aisles and shelves, mapped from the WooCommerce categories. Drives navigation AND the 301s (`lib/redirects.ts`, exported to `data/redirects/redirects.csv` by `npm run redirects:export`).
- `content/delivery.ts`: store coordinates, radius, town distances (postcodes.io, 20 Oct 2026).
- `lib/catalogue.ts`: product data access. Supabase when configured, the WooCommerce seed otherwise.
- `supabase/migrations/`: schema, validated in PGlite, applied to `zlzdjentqmjjnxmojtko` on 20 Oct 2026.
- `data/scrape/`: raw 20 Oct 2026 WooCommerce Store API dump. `data/seed/`: generated seed. `scripts/seed_from_wp.py` regenerates.

## Product images
- Packshots go in `public/images/packshots/<slug>-front.webp` / `-back.webp`, then `npm run packshots`. Until then, neutral placeholders.
- **Do not use the old WordPress product images on the site.** They are social-media screenshots with prices and captions printed on them (and at least one is the wrong product). They're kept in `media/wp-library/` for reference only.

## Working setup
- Claude builds in a cloud clone, syncs files into this folder and commits here; **Alex pushes** (Claude sessions can read the repo but can't push until the Claude GitHub App is installed on phantomdev-sys).
- Fonts: Clash Display + Satoshi from Fontshare, self-hosted in `public/fonts/`. Fontshare is blocked from Claude's side, so the files come from Alex's Mac.
- Verify: `npm run typecheck && npm run lint && npm run build`, then `check:contrast`, `check:a11y`, `check:screens` (cloud: `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`).
