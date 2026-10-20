# site-starter

Template repo for website builds. Clone it; don't re-derive it.

Everything here was extracted from a finished build so the foundation isn't
rebuilt from scratch each time. Improvements found on a project should flow
back here — that's the whole point of it existing.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict ·
Tailwind CSS v4 (CSS-first config) · lucide-react · Supabase (Postgres + RLS) ·
Vercel.

---

## Starting a project from it

```bash
# 1. Copy, don't fork — each project has its own history.
cp -R site-starter <project-name>
cd <project-name>
rm -rf .git

# 2. Name it after the domain: lowercase, hyphenated. colabr8-co-uk, teamjvc-org.
#    Matches the repo name, sorts predictably, and keeps similarly-named
#    businesses visually distinct in Finder.

npm install
cp .env.example .env.local     # optional — it builds without it
npm run dev
```

Then:

1. Fill in `CLAUDE.md` — especially the disambiguation block and the pinned
   identifiers table.
2. Copy the filled `PROJECT-BRIEF.md` into `briefs/`.
3. Replace the tokens in `app/globals.css` with the brand palette and run
   `npm run check:contrast` **before** building anything with it.
4. Delete `app/page.tsx` and design from the direction the client picked. It is
   a toolchain smoke test, not a homepage.

The repo builds and renders with no environment variables at all — the data
layer falls back to bundled sample content. That is what makes CI and preview
builds work without secrets.

### Pushing it to GitHub

Repo creation fails from a Cowork session (the sandbox token is scoped to
pre-configured repos — architectural, not a permission that can be granted), so
do it locally:

```bash
git init && git add -A && git commit -m "chore: initial commit from site-starter"
gh repo create phantomdev-sys/<project-name> --private --source=. --push
```

Vercel project creation likewise returns 403 from a session — import through
the dashboard, then paste the project ID into `CLAUDE.md`.

---

## What's in here

```
app/                  routes, layout, globals.css (tokens + motion system)
components/ui/        primitives — no business knowledge
components/site/      header, footer (incl. the legally required company details)
content/              site config, copy, sample data. No copy in components.
content/samples/      the offline fallback content
lib/supabase/         public.ts (cookie-free) and server.ts (cookie-aware)
lib/content/          data access with offline fallback
supabase/migrations/  timestamped, forward-only, RLS from the start
scripts/              verification gates
briefs/               PROJECT-BRIEF.md and OPEN-ITEMS-REGISTER.md
.claude/skills/       site-build, platform-safety, open-items-register
CLAUDE.md             project memory — pinned identifiers live here
```

### The parts worth understanding before changing them

**Two Supabase clients.** `publicClient()` is cookie-free and is the default —
pages using it can still prerender and revalidate. `serverClient()` is
cookie-aware, for anything involving a user session; reading cookies opts the
page into dynamic rendering, so using it for public content quietly makes the
whole site dynamic.

**Offline data fallback.** Every function in `lib/content/` tries the database
and falls back to `content/samples/` when it is unreachable or unconfigured.
It's why a fresh clone renders, why CI is green without secrets, and why the
build sandbox (where Supabase is blocked over HTTP) doesn't break builds.

**CSS-only scroll reveals.** `animation-timeline: view()` behind an `@supports`
check, so content is visible by default and animation layers on top. The common
IntersectionObserver + `opacity: 0` approach fails the other way — if the
script doesn't run, the content is invisible forever, and every automated check
still passes. Worst case here must be "no animation", never "no content".
Print styles force everything visible for the same reason.

**Safe markdown renderer.** `components/ui/markdown.tsx` renders React elements
from a small markdown subset, with no `dangerouslySetInnerHTML` anywhere. The
content often comes from a database a client edits, so there is deliberately no
HTML-injection surface. Extend it rather than swapping in a library that
accepts raw HTML.

**Click-to-load video facades.** No third-party request until someone presses
play — faster, and no tracking cookies set on page view, which keeps the cookie
policy honest.

---

## Verification

```bash
npm run verify   # typecheck, lint, build, contrast, a11y, screens, links, perf
```

Individually:

| Script | What it gates |
|---|---|
| `check:contrast` | Every token pairing against WCAG AA. **Run before building with a new palette**, not after. |
| `check:a11y` | axe-core, every route, desktop + mobile, `reducedMotion: 'reduce'`, zero AA violations. |
| `check:screens` | Full-page PNGs into `.verify/screens/`. A script can't pass this one — open them and look. |
| `check:links` | Internal 404s and dead anchors fail; external failures warn. |
| `check:perf` | 130 kB JS per route, 300 kB largest image, 1 MB homepage total. |

`check:a11y`, `check:screens`, `check:links` and `check:perf` need a production
build first (`npm run build`) and start their own server on port 3100.

Re-run everything after adding a page. Not once at the end.

---

## Fonts

Fontshare, self-hosted. Put the woff2 files in `public/fonts/`, add the
`@font-face` blocks in `app/globals.css`, and set `--font-stack-display` /
`--font-stack-body`.

Do **not** use `next/font/google` — Google Fonts is blocked in the build
container, so it fails the build rather than degrading gracefully.

Adobe Fonts is available on Alex's Creative Cloud subscription and is fine for
his own properties only. A client site would need the client's own
subscription, and if a subscription lapses every site using the kit silently
reverts to fallback fonts. When it is used, the integration is a plain
stylesheet link in the root layout:
`<link rel="stylesheet" href="https://use.typekit.net/KITID.css" />`.
