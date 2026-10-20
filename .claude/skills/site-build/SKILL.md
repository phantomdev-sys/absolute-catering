---
name: site-build
description: The end-to-end process for building a client or business website — pre-flight checks, brief intake, design direction, content migration, build, verification and handoff. Use this skill whenever the user wants to build, rebuild, redesign or launch a website, landing page or marketing site, or mentions a site build, a new project folder, a PROJECT-BRIEF, a site-starter clone, or a stack of Next.js + Tailwind + Supabase + Vercel. Use it even when the request sounds small ("can you just knock up a homepage") — the pre-flight and verification gates are exactly what stop small builds going wrong.
---

# Site build

This skill is the process spine for a website build. It exists because the
expensive mistakes on a build are almost never coding mistakes — they are
starting without a brief, discovering a blocked platform in the fortieth
minute rather than the second, producing a site that looks like every other
site, and calling it done without checking it.

Work through the phases in order. Each phase has a gate: don't move on until
it's met.

**Language: British English throughout** — in the site copy, in code comments,
in commit messages and in what you say to the user.

## Reference files

Read these when you reach the phase that needs them, not up front.

| File | Read it when |
|---|---|
| `references/stack-conventions.md` | Phase 5, before writing any code. Stack, patterns, sandbox quirks. |
| `references/design-direction.md` | Phase 3. How to produce three genuinely distinct directions, plus the anti-pattern list and font policy. |
| `references/content-migration.md` | Phase 4, if there's an existing site to migrate from. |
| `references/compliance.md` | Phase 4 and again at Phase 6. Per-sector legal and policy requirements. |
| `references/verification.md` | Phase 6. The mandatory gates and how to run them. |

Two companion skills should also be active. Don't duplicate their content here:

- **platform-safety** — governs every Supabase, Vercel and GitHub call. It fires
  on its own; if it hasn't, read it before touching a connector.
- **open-items-register** — keeps `briefs/OPEN-ITEMS-REGISTER.md` current.

---

## Phase 0 — Pre-flight

Do this *before* any code, any folder creation, any design talk. The goal is to
surface every blocker inside the first two minutes rather than the fortieth. A
past build lost real time to exactly this being skipped.

Run through the checklist and report the results as a short table:

1. **Working directory.** Confirm the exact absolute path you will be writing
   to, and say it back to the user. Everything happens inside it. Write it into
   the project's `CLAUDE.md` as soon as one exists.
2. **Assets folder readable.** List the project folder. Confirm you can see
   `brand/`, `copy/`, `media/`, `reference/`. Say what's actually in them — an
   empty `media/` is a finding worth raising now.
3. **GitHub repo creation.** Expect this to fail from a Cowork session; the
   sandbox token is scoped to pre-configured repos and rejects creation
   regardless of account permissions. Confirm rather than assume, then tell the
   user they'll need to run `gh repo create` locally.
4. **Vercel project creation.** Expect a 403; the connector's OAuth grant is
   read-only. Reading teams and projects works. The user imports through the
   dashboard.
5. **Supabase.** Identify the organisation, confirm whether a new project
   incurs cost (`get_cost` before `create_project` — never skip the cost
   confirmation), and note the project ref of anything that already exists.
6. **Tooling.** Check what connectors are actually available in *this* session
   rather than assuming — see "Discover tools, don't hard-code them" below.

**Gate:** the user has seen the pre-flight table and knows which of the two
known blockers apply. Log any blocker in the open items register.

### Discover tools, don't hard-code them

Connector availability shifts between sessions and the registry changes over
time. Before reaching for a named tool, check what's present and pick the best
fit. Say which one you chose and why. If a capability the brief assumes is
missing — image generation, a particular CMS, an analytics provider — raise it
in pre-flight rather than silently substituting.

(Known gap: there is no Higgsfield connector in the registry. If it's wanted it
has to be added as a custom MCP, or the assets generated there by hand and
dropped into `public/`.)

---

## Phase 1 — Brief intake

The brief is the input. The session should not have to conduct an interview —
ten minutes of the user filling `PROJECT-BRIEF.md` saves an hour of clarifying
questions.

1. Read `PROJECT-BRIEF.md` from the project folder in full.
2. **Read the disambiguation block first and out loud.** If the brief names a
   business that could be confused with another, restate the distinction in
   your own words before doing anything else, and pin the domains. Businesses
   with near-identical names are a live risk; a mix-up here is expensive and
   is not recoverable by a later check.
3. List what's missing. Distinguish *blocking* gaps (no domain, no idea what
   the business does, no brand colours and no permission to choose them) from
   *non-blocking* ones (no photography yet — proceed with clearly-labelled
   placeholders and log it).
4. Ask about blocking gaps only. Log non-blocking gaps to the register.

**Gate:** blocking gaps resolved, register created with the non-blocking ones.

---

## Phase 2 — Project setup

1. Clone or copy `site-starter` into the project folder. Name it lowercase and
   hyphenated, mirroring the domain: `colabr8-co-uk`, `colabr8-tech`,
   `teamjvc-org`. This matches the repo name, sorts predictably and — the real
   reason — makes similarly-named businesses visually distinct in Finder.
2. Fill in `CLAUDE.md`: business name, the disambiguation block copied
   verbatim from the brief, the working directory, and a **pinned identifiers**
   block for the Supabase project ref, Vercel project ID and GitHub repo. Some
   will be unknown on day one — write `TBD` and fill them the moment they
   exist, not later.
3. Start `briefs/OPEN-ITEMS-REGISTER.md` from the starter's empty copy.

**Gate:** `CLAUDE.md` exists with the disambiguation block and the pinned
identifiers section, even if some values are TBD.

---

## Phase 3 — Design direction, before any code

This is the highest-leverage step in the whole process. It is what stops every
site looking like a sibling of the last one. Do not skip it because the brief
"already says what they want" — the brief says what the business is; the
direction says what the site *feels* like.

Read `references/design-direction.md` and produce **three genuinely distinct
directions, described in words**. Each covers type pairing, colour strategy,
layout system, motion personality, and one **signature moment** unique to that
brand. No code, no mockups yet.

Then stop and let the user pick one. Ask which of the three, and whether they
want anything from the other two grafted in.

**Gate:** the user has picked a direction. Validate the chosen palette for
contrast *before* building with it (see Verification) — retro-fixing tokens
after the fact is far more work.

---

## Phase 4 — Content

Content lives in a `content/` directory, never hard-coded in components. That
is what makes a rewrite a text edit rather than a refactor.

- If there's an existing site to migrate from, read
  `references/content-migration.md`.
- If there isn't, draft real copy from the brief. Placeholder copy that reads
  like placeholder copy is on the anti-pattern list — write something a human
  would actually publish, and mark clearly what the user must verify.
- Read `references/compliance.md` for the sector and add the required pages to
  the sitemap now, not as an afterthought. A UK limited company is legally
  required to display its company number and registered office.

**Gate:** every page in the sitemap has content, real or explicitly marked as
awaiting the client, and the compliance pages are in the sitemap.

---

## Phase 5 — Build

Read `references/stack-conventions.md` before writing code. In summary:

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict ·
  Tailwind CSS v4 (CSS-first, no `tailwind.config`) · lucide-react ·
  Supabase (Postgres + RLS) · Vercel · GitHub.
- Server Components by default; `"use client"` only for state or events.
- Never hard-code a colour — everything from tokens, so a rebrand is one edit.
- Comment the *why*, not the what.
- Content from `content/`, never inline.

Build in this order, verifying as you go rather than at the end: tokens and
layout shell → primitives → homepage → remaining pages → forms → data.

Keep the open items register current as you go, and prompt to commit whenever
it changes.

---

## Phase 6 — Verification

Read `references/verification.md` and run every gate. These are gates, not
hopes: each one is on the list because it caught a real bug.

Headlines:

- `npm run build` and `npm run lint` clean.
- axe-core across **every** route, desktop and mobile, zero WCAG 2.1 AA
  violations, run with `reducedMotion: 'reduce'`.
- Palette contrast validated against 4.5:1 (done back in Phase 3, re-checked
  here if tokens changed).
- **Full-page screenshots that you actually look at.** Automated checks once
  passed a page whose content was invisible; only looking caught it.
- Link check and a performance budget.
- Re-run everything after adding a page. Not once at the end.

**Gate:** all of the above pass, and you have said explicitly which ones you
ran and what they returned. "Verified" without naming the checks is not
verification.

---

## Phase 7 — Handoff

1. Summarise what was built, page by page.
2. State what the user must do that you could not: `gh repo create`, the Vercel
   import, DNS, any credentials.
3. Hand over the open items register as the live to-do list.
4. Name every decision you made that they should sanity-check — copy you
   invented, a colour you chose, a fallback you assumed.
5. Note what would most improve the site next. Almost always the answer is
   **real photography and real copy**: craft carries a build a long way, but
   the largest gap between an expensive-looking site and a cheap-looking one is
   genuine content, and no amount of code closes it.
