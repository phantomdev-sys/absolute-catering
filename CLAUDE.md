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
| Supabase project ref | TBD (not yet created; check cost first) |
| Vercel team | phantom-dev1 (`team_HqP6SQwx4jkuTVYNACgBcyyI`) |
| Vercel project ID | TBD (Alex imports via dashboard) |
| GitHub repo | TBD (Alex runs `gh repo create phantomdev-sys/absolute-catering`) |
| Stripe account | TBD (new or existing? see register) |

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
- `docs/ARCHITECTURE-PLAN.md`: architecture and phases (awaiting Alex's approval).
- `data/scrape/`: raw 20 Oct 2026 WooCommerce Store API dump. `data/seed/`: generated seed. `scripts/seed_from_wp.py` regenerates.
