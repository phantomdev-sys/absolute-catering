---
name: platform-safety
description: Safety rules for account-wide platform connectors — Supabase, Vercel and GitHub. Use this skill in ANY session that might call a Supabase, Vercel or GitHub tool, or run git commands, not only during a website build. Trigger it before applying a migration, running SQL, deploying, creating or pausing a project, changing deployment protection, pushing, force-pushing or deleting a branch, and whenever a session works on one project while other projects exist in the same account. It exists to stop an operation landing on the wrong project.
---

# Platform safety

The connectors in this session are **account-wide**. A Supabase migration, a
Vercel deploy or a `git push` reaches every project on the account, not just
the one being worked on. The filesystem is the lesser risk — a stray file is
noticed and deleted. A migration applied to the wrong database is not.

The requirement is absolute: **no other project may be touched, ever.**

Everything below is designed around one observation — the wrong project gets
hit not through carelessness in the moment, but through a *plausible-looking
chain of calls* where an identifier was inferred rather than pinned.

---

## 1. Pin identifiers on day one

The moment a project has a Supabase project ref, a Vercel project ID or a
GitHub repo, write all three into the project's `CLAUDE.md`:

```markdown
## Pinned identifiers — verify before every mutating call

| Platform | Identifier | Value |
|---|---|---|
| Supabase | project ref | `abcdefghijklmnopqrst` |
| Vercel   | project id  | `prj_XXXXXXXXXXXXXXXXXXXXXXXX` |
| GitHub   | repo        | `phantomdev-sys/colabr8-co-uk` |
| Local    | working dir | `/Users/Dad/Desktop/Website Builds/colabr8-co-uk` |

Anything not on this list is another project. Do not touch it.
```

Unknown values are written as `TBD` and filled the moment they exist. A `TBD`
is a known gap; an absent row is an invitation to guess.

**Re-read this block before every mutating call.** Not once per session — the
session is long, context moves, and the read costs nothing.

## 2. Never chain list-then-mutate

Calling `list_projects` and acting on a result in the same breath is how the
wrong database gets a migration. The list is ordered by something you don't
control, the names are similar by design, and the second call looks correct in
the transcript right up until it isn't.

```
✗  list_projects → take result[0].id → apply_migration
✓  read CLAUDE.md pinned ref → apply_migration with that literal ref
```

Listing is fine for *discovery* — finding out what a project's ref is, once, so
it can be pinned. It is never the input to a mutation in the same turn. If a
listing is the only source of an identifier, stop, write it into `CLAUDE.md`,
say so, and then act on the pinned value.

The same applies to `list_teams`, `list_deployments`, `list_branches` and
`list_organizations`.

## 3. Calls that need the pinned identifier and a stated intention

Before any of these, say in one line what you are about to do, to which named
project, and why. Stating it is what makes a mismatch visible while it can
still be stopped.

**Supabase:** `apply_migration`, `execute_sql`, `deploy_edge_function`,
`create_project`, `pause_project`, `restore_project`, `create_branch`,
`delete_branch`, `merge_branch`, `rebase_branch`, `reset_branch`.

**Vercel:** `deploy_to_vercel`, `create_git_project`,
`update_project_deployment_protection`, `pause_project`, `unpause_project`,
`buy_domain`, and anything that spends money.

**Git / GitHub:** any `git push`, force-push, branch deletion, tag deletion, or
history rewrite. Also `git remote` changes — a wrong remote turns every
subsequent push into a cross-project write.

`create_project` on Supabase and anything on Vercel that spends money also
needs an explicit cost check (`get_cost`, `get_purchase_quote`) and the user's
confirmation of the amount before proceeding. Never confirm a cost on the
user's behalf.

## 4. One working directory

Confirm the absolute working directory at the start of the session, say it back
to the user, and write it into `CLAUDE.md`.

- Never run git commands outside it. `cd` in a compound command is exactly how
  a git command escapes its project.
- If you are about to read or write outside that path — **stop and ask.** Not
  "ask afterwards"; the point of asking is that it happens first.
- Sibling project folders are the highest-risk neighbours precisely because
  their paths look almost identical.

## 5. Destructive SQL

Never `drop table`, `drop schema`, `truncate`, or an `update`/`delete` without a
`where` clause on a project holding real data, without explicit confirmation
that **names the table**. "Yes go ahead" is not confirmation; "yes, drop
`public.enquiries`" is.

Before any destructive statement, state the row count you're about to affect.
On a project with real data, prefer a reversible path: rename rather than drop,
add a nullable column rather than rewriting a table, and write a forward
migration rather than editing an applied one.

Migrations are forward-only. A migration that has been applied is history; fix
it with another migration.

After every migration, run `get_advisors(type: "security")` and
`get_advisors(type: "performance")`. PostgREST exposes anything in the public
schema as an RPC endpoint, trigger functions included — `revoke execute` on
them is part of the migration, not a follow-up.

## 6. Known blockers — architectural, not permissions

These fail from Cowork sessions regardless of account permissions. They are not
something the user can grant, so don't spend the session trying, and don't ask
them to change a setting that won't help. Surface both in the pre-flight check
so they're known in minute two.

**GitHub repo creation fails.** The sandbox token is scoped to pre-configured
repos and rejects creation. The user runs `gh repo create` locally, then the
session can work with the repo.

**Vercel project creation returns 403.** The connector's OAuth grant is
read-only. Reading teams and projects works; creating does not. The user
imports the repo through the Vercel dashboard.

## 7. When something looks off

Signals worth stopping on: a project name that nearly matches but isn't
identical; a ref that differs from `CLAUDE.md`; a tool returning more projects
than expected; a deploy targeting a domain nobody mentioned; a git remote you
didn't set.

In every case the correct move is to stop and ask, and it is cheap. Reversing a
migration on a live database is not. There is no version of this where guessing
is the better trade.

---

## Quick check before any mutating call

1. Have I re-read the pinned identifiers in `CLAUDE.md`?
2. Am I passing an explicit literal identifier, not a value from a list call?
3. Have I said out loud which named project this touches?
4. Is this destructive, and if so has the user confirmed it by name?
5. Am I inside the one working directory?
