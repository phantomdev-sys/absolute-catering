# Stack and conventions

Read this at Phase 5, before writing code.

## The stack — settled, don't re-litigate

| Layer | Choice |
|---|---|
| Framework | Next.js 16 — App Router, Turbopack |
| UI | React 19 |
| Language | TypeScript, `strict: true` |
| Styling | Tailwind CSS v4, CSS-first config (there is no `tailwind.config`) |
| Icons | lucide-react |
| Data | Supabase — Postgres with RLS |
| Hosting | Vercel |
| Source | GitHub |
| Fonts | Fontshare, self-hosted (see `design-direction.md`) |

Adding a dependency is a decision worth justifying in a sentence. Most things a
marketing site needs are already here.

---

## Working style

- **British English throughout** — copy, comments, commit messages.
- **Comment the *why*, not the what.** `// cookie-free client so this page can
  prerender` earns its place; `// create the client` does not.
- **Content lives in `content/`**, never hard-coded in components. A copy change
  should be a text edit, not a refactor.
- **Never hard-code a colour.** Everything from tokens, so rebranding is one
  edit in one file.
- **Server Components by default.** `"use client"` only for state or events, and
  push it as far down the tree as it will go — a client component at the page
  level opts the whole page out of prerendering.
- **Keep `briefs/OPEN-ITEMS-REGISTER.md` current** and prompt to commit whenever
  it changes.

---

## Sandbox quirks — real, and cost time to rediscover

These are properties of the cloud container the session runs in, not of the
stack. They are not bugs to fix; they are constraints to design around.

1. **Google Fonts is blocked.** `next/font/google` therefore *fails the build*,
   not just at runtime. Self-host woff2 files in `public/fonts/`, or use a plain
   stylesheet `<link>`.
2. **Arbitrary hosts, including Supabase, are blocked over HTTP.** A `fetch` to
   the database from the sandbox will fail even when everything is configured
   correctly. Verify database work through the Supabase MCP tools instead. This
   is also the main reason the offline data fallback below exists.
3. **Library APIs drift.** lucide-react v1 dropped brand icons — `Youtube` no
   longer exists. Before assuming an export is there, check `node_modules`:
   `grep -r "export.*Youtube" node_modules/lucide-react/dist/lucide-react.d.ts`.
4. **Next 16 route `params` are Promises** and must be awaited:
   ```tsx
   export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
     const { slug } = await params;
   }
   ```
5. **Tailwind v4 has no JS config file.** Tokens live in `@theme` in the CSS.
   Anything that reaches for `tailwind.config.ts` is out of date.
6. **v3 arbitrary-value syntax silently does nothing in v4.** This one is
   nasty because it doesn't error — the class is emitted, no rule is generated,
   and the page renders with the property simply absent. It was caught on this
   starter only by looking at a screenshot and noticing sections had no
   padding.

   ```
   ✗ py-[--spacing-section]              ✗ font-[family-name:--font-display]
   ✓ py-section                          ✓ font-display
   ```

   Tokens declared in a `@theme` namespace generate their own utilities:
   `--spacing-section` gives `p-section`/`py-section`, `--font-display` gives
   `font-display`, `--ease-out-soft` gives `ease-out-soft`. Prefer those. For a
   one-off variable that isn't a token, v4's syntax is `py-(--my-var)`.

   Worth checking after any change to the token names:
   `grep -o "\.py-section{[^}]*}" .next/static/chunks/*.css` — if the rule
   isn't in the built CSS, the class isn't doing anything.

---

## Patterns that solved real problems

### Offline data fallback

Every data-access function reads the database and falls back to bundled sample
content when the database is unreachable or unconfigured.

```ts
export async function getPosts(): Promise<Post[]> {
  const supabase = publicClient();
  if (!supabase) return samplePosts; // no env vars — a fresh clone still renders

  const { data, error } = await supabase.from('posts').select('*').eq('published', true);
  if (error || !data) return samplePosts; // network blocked, or the table isn't there yet
  return data;
}
```

The payoff is bigger than it looks: a fresh clone with no `.env.local` still
builds and renders every route, which is what makes CI green and preview builds
work without handing secrets to them. It is also what makes the sandbox's
blocked network survivable.

Sample content lives in `content/samples/` and should be *plausible*, not
lorem ipsum — you will end up looking at it in screenshots.

### Two Supabase clients

- **`lib/supabase/server.ts`** — cookie-aware, for anything involving a user
  session. Reading cookies opts the page into dynamic rendering, which is
  correct for authenticated content and wasteful for public content.
- **`lib/supabase/public.ts`** — cookie-free, anon key only, for public
  content. Pages using it can prerender and revalidate on a schedule.

Reach for the public one by default. Using the cookie-aware client for a public
marketing page is the single easiest way to accidentally make an entire site
dynamic.

### Gate child rows in RLS, not application code

Child records visible only when the parent is published, enforced in the
database:

```sql
create policy "child rows follow parent visibility"
on public.event_sessions for select
using (
  exists (
    select 1 from public.events e
    where e.id = event_sessions.event_id and e.published = true
  )
);
```

A query that forgets the filter then cannot leak a draft. Application-level
filtering is one forgotten `.eq()` away from a leak, and that forgotten `.eq()`
is invisible in review.

### Revoke execute on trigger functions

PostgREST exposes anything in the public schema as an RPC endpoint, trigger
functions included. Every migration that creates one ends with:

```sql
revoke execute on function public.handle_updated_at() from anon, authenticated;
```

Then run `get_advisors(type: "security")` — Supabase's linter catches what you
miss.

### CSS-only scroll reveals

Content is visible by default; animation layers on top.

```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .reveal {
      animation: reveal-in linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 40%;
    }
  }
}

@media print {
  .reveal { animation: none !important; opacity: 1 !important; transform: none !important; }
}
```

The IntersectionObserver-plus-`opacity: 0` approach is the common alternative
and it is a trap: if the script fails to run — a JS error elsewhere, a slow
hydration, a blocked bundle — the content is permanently invisible. Worst case
here must be "no animation", never "no content". The print styles are part of
the same principle: a printed page has no scroll to drive the timeline.

### Click-to-load video facades

Render a poster image and a play button; only load the third-party embed when
someone presses play. Faster first load, and no tracking cookies set on page
view — which also keeps the cookie policy honest.

---

## Naming and structure

Project folders and repos are lowercase, hyphenated, mirroring the domain:
`colabr8-co-uk`, `colabr8-tech`, `teamjvc-org`.

```
app/                 routes; route groups for layout variants
components/ui/       primitives — no business knowledge
components/site/     composed sections that know about this site
content/             copy, config, sample data. No copy in components.
lib/supabase/        the two clients
lib/content/         data access with offline fallback
supabase/migrations/ timestamped, forward-only
briefs/              PROJECT-BRIEF.md, OPEN-ITEMS-REGISTER.md
scripts/             verification scripts
```

Migrations are timestamped and forward-only: `20260822T1430_add_events.sql`.
Never edit a migration that has been applied — write another one.
