# Verification gates

Read this at Phase 6. Every check here is on the list because it caught a real
bug on a real build. They are gates, not hopes: a build is not done until each
has been run and its result stated.

Two rules that matter more than the individual checks:

- **Re-run everything after adding a page.** Not once at the end. A page added
  after verification is an unverified page, and it is usually the one that
  ships broken.
- **Say which checks you ran and what they returned.** "Verified" with no
  detail is not verification. A short table of check → result → notes is the
  deliverable.

The `site-starter` repo ships these as npm scripts. In a project cloned from
it, the whole set is `npm run verify`.

---

## 1. Build and lint

```bash
npm run build
npm run lint
```

Both clean — no warnings suppressed to get there. A build that only succeeds
with `--no-lint` or a disabled rule is a failed gate with extra steps.

Common causes of failure worth recognising immediately:

- `next/font/google` — Google Fonts is blocked in the cloud container and this
  fails the build. Self-host or use a stylesheet link.
- A missing export from a library that used to have it. lucide-react v1 dropped
  its brand icons (`Youtube` no longer exists). Check `node_modules` before
  assuming an export is there.
- Next 16 route `params` are Promises and must be awaited.

---

## 2. Palette contrast — before building, not after

Run this at **Phase 3**, as soon as the client picks a direction, and again
here if any token changed since.

```bash
npm run check:contrast
```

It reads the colour tokens from `app/globals.css` and checks every
foreground/background pairing against WCAG 4.5:1 for body text and 3:1 for
large text and UI boundaries.

This is up front rather than at the end because a previous build had to
retro-fix two tokens that came in at 3.5:1 — by which point the palette was
threaded through every component. Catching it before the first component is a
five-minute conversation with the client about a slightly darker blue.

If a brand colour genuinely cannot meet 4.5:1, don't quietly darken it: tell
the client, and propose a compliant *text* variant of the brand colour that
sits alongside the original, which stays for large display use and fills.

---

## 3. Accessibility — axe-core, every route, both viewports

```bash
npm run check:a11y
```

Requirements:

- **Every route**, not a sample. Enumerate them from the app directory or the
  sitemap; don't hand-maintain a list that drifts.
- **Desktop and mobile viewports.** Mobile catches touch target size, reflow at
  320px, and menus that trap focus.
- **Zero WCAG 2.1 AA violations.** Not "only minor ones".
- **Run with `reducedMotion: 'reduce'`.** This one is not optional and is not
  obvious: without it, axe measures elements mid-animation and reports contrast
  failures that don't exist. Chasing those wastes an afternoon and can lead to
  "fixing" a palette that was fine.

```js
// the shape that matters, in scripts/check-a11y.mjs
const context = await browser.newContext({
  viewport,
  reducedMotion: 'reduce', // else axe samples mid-animation and reports phantom contrast failures
});
```

Things axe cannot check that still need a human pass: focus order makes sense,
the keyboard can reach and operate everything (tab through the whole page
once), link text means something out of context, and headings describe the
structure rather than the type size.

---

## 4. Full-page screenshots — that you actually look at

```bash
npm run check:screens
```

Writes full-page PNGs for every route at both viewports into
`.verify/screens/`. **Open them and look.** Then show them to the user.

This gate exists because on a previous build every automated check passed on a
page whose content was invisible — the markup was there, axe was happy, the
build was clean, and the page rendered blank. Only looking caught it.

What to look for: content actually visible, no overlapping text, no element
running off the right edge, images loaded rather than showing alt text, and
the mobile view not simply being the desktop view scaled down.

---

## 5. Link check

```bash
npm run check:links
```

Crawls the built site and reports 404s, including anchors that point at ids
that don't exist, and `mailto:`/`tel:` links with typos in them. External links
are checked but a failure there is a warning, not a gate — sites go down.

---

## 6. Performance budget

```bash
npm run check:perf
```

The budget, enforced against the production build:

| Metric | Budget |
|---|---|
| First Load JS, any route | ≤ 130 kB |
| Largest single image shipped | ≤ 300 kB |
| Total page weight, homepage | ≤ 1 MB |
| Fonts loaded | ≤ 4 files |

Budgets are deliberately modest — most of the sites this system builds are
marketing sites, and a marketing site that needs more than 130 kB of JS has
usually reached for a client component where a server one would do.

If a budget is exceeded, the fix is nearly always one of: an unnecessary
`"use client"`, an image that wasn't run through `next/image`, or a library
imported for one function.

---

## 7. Database checks, if there's a database

After **every** migration:

```
get_advisors(type: "security")
get_advisors(type: "performance")
```

Specifically watch for trigger functions exposed as RPC endpoints — PostgREST
exposes anything in the public schema, so `REVOKE EXECUTE` on trigger functions
is part of the migration, not a follow-up.

Also confirm by hand: RLS is enabled on every table, and child rows are gated
on the parent's published state *in the policy*, not in application code.

Note that arbitrary hosts including Supabase are blocked over HTTP from the
sandbox — verify database work through the Supabase MCP tools, not `fetch`.

---

## Reporting the result

```markdown
| Check | Result | Notes |
|---|---|---|
| build | pass | |
| lint | pass | |
| contrast | pass | accent-600 raised from #5B7FE8 to #3D5FC4 to clear 4.5:1 |
| axe (12 routes × 2 viewports) | pass | 0 violations |
| screenshots | reviewed | mobile /contact form label wrapped, fixed |
| links | pass | 1 external warning (partner site 503) |
| perf | pass | homepage first load 96 kB |
| supabase advisors | pass | |
```
