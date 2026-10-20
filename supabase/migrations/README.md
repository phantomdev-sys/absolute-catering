# Migrations

Conventions, kept short because the rules that matter are few.

**Naming.** `YYYYMMDDTHHMM_short_description.sql`, e.g.
`20260822T1430_add_posts.sql`. Timestamped so ordering is unambiguous, and
described so a directory listing reads as a history.

**Forward-only.** Never edit a migration that has been applied — it is history.
Fix it with another migration. Editing an applied migration means the database
and the repo disagree, and nothing will tell you.

**One concern per migration.** A migration that adds a table and changes an
unrelated policy is a migration you cannot reason about when it fails halfway.

**Every table gets RLS.** Enabled in the same migration that creates the table,
never "added later". A table with RLS off is readable by anyone with the anon
key, which is published in the client bundle by design.

**Gate child rows in the policy, not in application code.** Child records
visible only when the parent is published, enforced in the database — so a
query that forgets the filter cannot leak a draft. Application-level filtering
is one forgotten `.eq()` away from a leak, and that omission is invisible in
review.

**Revoke execute on trigger functions.** PostgREST exposes anything in the
public schema as an RPC endpoint, trigger functions included. The `revoke` is
part of the migration, not a follow-up.

**Run the advisors after every migration:**

```
get_advisors(type: "security")
get_advisors(type: "performance")
```

Supabase's linter catches what you miss — including the RPC exposure above.

**Applying them.** Through the Supabase MCP `apply_migration`, always with the
project ref pinned in `CLAUDE.md` and never with a ref taken from a
`list_projects` call in the same turn. See the `platform-safety` skill.

Note that arbitrary hosts including Supabase are blocked over HTTP from the
build sandbox, so verify database work through the MCP tools rather than
`fetch`.
