# Content migration

Read this at Phase 4 when there's an existing site to move from.

A migration is mostly an inventory problem, not a technical one. The failure
mode is not "the copy came across badly" — it's "nobody noticed the old site had
a page about funding applications until a client rang about it six weeks later".

---

## 1. Inventory before anything else

Build a complete list of what exists. Don't work from the navigation — the
navigation is what the old site *chose* to show, and orphaned pages that still
get traffic are exactly the ones that get lost.

Sources, in order of reliability:

1. `/sitemap.xml` — usually the most complete.
2. `/robots.txt` — often points at more than one sitemap.
3. A crawl of the site from the homepage.
4. The CMS's own page list, if there's access.
5. Analytics, if there's access: any URL with traffic in the last 12 months.

Record for each page: URL, title, purpose, last updated, whether it has inbound
traffic, and a keep / merge / drop decision. Put the table in
`reference/content-inventory.md` in the project folder — it's the artefact the
client signs off on, and it's what you check the finished site against.

Migrating everything is usually wrong. Most old sites have accreted pages nobody
has read in years. But *dropping* a page is a decision for the client, so present
the recommendation rather than acting on it.

---

## 2. Capture, don't screenshot

Pull the actual text. Copy typed out from a screenshot picks up errors, and
loses the links inside sentences.

For each kept page, produce a markdown file in `copy/` with the heading
structure preserved, inline links kept as markdown links, and a note of any
images used and where they live. Images want downloading at full resolution
now — the old site may go offline the day DNS changes.

Watch for content that isn't in the page body: things in a footer, a cookie
banner, form confirmation text, transactional email templates, PDF downloads,
and alt text. PDFs in particular tend to be the only copy of policies.

---

## 3. Rewrite, don't transplant

Copy written for the old design will not fit the new one. A hero that assumed a
three-line headline breaks a design built around one line. Rewriting to fit is
part of the job, not scope creep.

The rule for what may change without asking: structure, length, and formatting
may be adapted freely. **Facts, claims, prices, names, dates, qualifications,
accreditations and legal wording may not.** If a claim looks wrong or out of
date, flag it rather than correcting it — an accreditation that lapsed is the
client's problem to fix, and an invented one is a liability.

Anything you write from scratch gets marked clearly for the client to verify.

---

## 4. URLs and redirects

Preserve URLs where you reasonably can. Where you can't, every changed URL needs
a 301 to its new home, and every dropped page needs a 301 to the most relevant
survivor — not to the homepage, which search engines treat as a soft 404 and
which strands the visitor.

In Next.js, `redirects()` in `next.config.ts`:

```ts
async redirects() {
  return [
    { source: '/about-us.html', destination: '/about', permanent: true },
    { source: '/services/:slug*', destination: '/what-we-do/:slug*', permanent: true },
  ];
}
```

Keep the map in `reference/redirects.md` alongside the inventory so the client
can see the decisions. Test it after deploy — a redirect that loops takes a page
off the internet.

Also carry across: `sitemap.xml` (generated, not hand-written), `robots.txt`,
and any verification files for search consoles or analytics that live at the
domain root. Losing a search console verification is a small thing that costs a
support ticket.

---

## 5. What people forget

Run through this list explicitly; each item has been missed on a real
migration.

- Form destinations. Where did the old contact form actually send? Somebody's
  personal inbox, usually. Confirm before switching.
- Email addresses published on the site — they are often forwarded aliases that
  need recreating.
- Third-party embeds: booking widgets, maps with a saved pin, review widgets,
  a chat tool.
- Anything on a subdomain. `blog.` and `shop.` are separate sites that the
  client thinks of as one.
- Old blog post URLs, if there's a blog. They hold most of the inbound links.
- Structured data (opening hours, reviews, events) that fed rich results.
- The favicon and social share images.
- SSL and DNS: who holds the domain, and does the client have access.

---

## 6. Verify the migration

Before handoff, check the finished site against the inventory:

- Every "keep" page exists and its content matches.
- Every "drop" and "merge" URL 301s somewhere sensible.
- The link checker passes (see `verification.md`).
- A search for the old site's distinctive phrases finds them on the new one, or
  the inventory says why not.

Log anything unresolved in the open items register rather than leaving it in
your head.
