---
name: open-items-register
description: Maintain a project's open items register — the single running list of unresolved questions, blockers, decisions awaiting sign-off and things waiting on someone else. Use this skill whenever work on a project surfaces something that can't be resolved now, whenever the user asks what's outstanding or where a project stands, at the start of a session to pick up where the last one left off, and before any handoff or summary. Keep `briefs/OPEN-ITEMS-REGISTER.md` current and prompt to commit it whenever it changes.
---

# Open items register

A long project generates a steady trickle of things that can't be resolved
right now: a missing asset, a question only the client can answer, a decision
made provisionally, a blocker on someone else. Held in conversation, they are
lost the moment the session ends. Held in a file, they survive.

The register is the project's memory of what is unresolved. It lives at
`briefs/OPEN-ITEMS-REGISTER.md`, it is committed to the repo, and it is the
first thing a new session should read and the last thing a handoff should
reference.

---

## The file

`assets/OPEN-ITEMS-REGISTER-template.md` in this skill is the starting point.
Copy it into `briefs/` on any project that doesn't have one.

Structure:

```markdown
# Open items register — <project name>

Last updated: <date> · Open: <n> · Blocked: <n>

## Open

| # | Item | Owner | Raised | Status | Notes |
|---|------|-------|--------|--------|-------|
| 12 | Company registration number for the footer | Client | 2026-08-20 | Blocked | Legally required before launch |
| 13 | Hero photography — placeholder in place | Client | 2026-08-21 | Waiting | Shoot booked 4 Sep |
| 14 | Confirm contact form destination address | Client | 2026-08-22 | Open | Currently going to the old alias |

## Resolved

| # | Item | Resolved | Outcome |
|---|------|----------|---------|
| 11 | Which of the three design directions | 2026-08-19 | Direction B, with the type scale from C |
```

Rules that keep it usable:

- **Numbers are never reused.** A resolved item keeps its number and moves to
  the Resolved section. References to "item 12" in old notes stay valid.
- **Every item has an owner** — the client, the user, or the session. An item
  with no owner is an item nobody will pick up.
- **Statuses are few:** `Open` (actionable now), `Waiting` (on someone else),
  `Blocked` (can't proceed at all), `Decided` (settled provisionally, may need
  revisiting).
- **Resolved items are not deleted.** The record of *how* something was decided
  is the most valuable thing in the file six weeks later.
- One line per item. If an item needs three paragraphs it's a document with a
  link from the register, not a register entry.

---

## When to add an item

Add it the moment it surfaces, in the same turn — not at the end of the
session, when it will be half-remembered or missed.

Things that belong in the register:

- A question only the client can answer.
- An asset that's missing, with what's standing in for it.
- A decision made without full information, and what would change it.
- A blocker on a platform, a permission, or a third party.
- Something deliberately deferred, so it reads as a choice rather than an
  oversight.
- Anything you had to guess at. Guesses that aren't logged become facts.

Things that don't: ordinary next steps in work already underway, and anything
resolvable in the next two minutes — resolve it instead.

---

## When to update

- **Start of a session:** read the register before anything else, and say what's
  open. This is what makes a new session continuous with the last one.
- **During work:** add items as they surface; move items to Resolved as they're
  answered, with the outcome recorded.
- **Before any handoff or summary:** the register is the to-do list you hand
  over. A summary that doesn't reconcile with it is missing something.
- **When the user asks where things stand:** answer from the register, then say
  anything that hasn't made it in yet — and add it.

Update the `Last updated` line and the counts on every change. Stale counts
train people to stop trusting the file.

---

## Committing

**Whenever the register changes, prompt to commit it.** Not silently, and not
batched with unrelated work — the register's value depends on the committed
copy being current, and an uncommitted register is one closed laptop away from
not existing.

```
Register updated — item 14 added (contact form destination). Commit it?
```

Suggested message: `docs(register): add #14 contact form destination`.

If a commit is declined, say plainly that the register is ahead of the repo, so
the next session knows to look for uncommitted changes.

---

## Reporting

When asked what's outstanding, lead with what is *blocking*, then what is
waiting on someone else, then what's merely open. Give the count, name the
owner on each, and say what the oldest item is — an item that has been open
for three weeks is usually an item that needs escalating rather than repeating.
