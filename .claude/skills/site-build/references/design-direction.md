# Design direction

Read this at Phase 3, before any code exists.

The purpose of this phase is divergence. Left to itself, a build converges on
the same site every time: a centred hero, three cards, Inter, a soft purple
gradient. That site is competent and forgettable. Describing three genuinely
different directions in words — and letting the client pick — is what produces
a site that belongs to *this* business.

Words first, deliberately. Mockups anchor a client to whichever one you built
most carefully; prose keeps all three live and makes the trade-offs discussable.

---

## What a direction contains

Each of the three needs all five. A direction missing motion or a signature
moment is a colour scheme, not a direction.

### 1. Type pairing

Name the display face and the text face, and say what the pairing *does*. "Clash
Display for headings, General Sans for body" is a fact; "Clash Display's tight
apertures and heavy weights give headlines a compressed, editorial authority,
cooled down by General Sans's neutral text setting so the page doesn't shout"
is a direction.

Include the scale strategy: is this a big-jump display scale (a 6rem hero
dropping to 1rem body) or a tight, documentary scale where hierarchy comes from
weight and spacing rather than size?

### 2. Colour strategy

Not a palette — a strategy. Which colour does the work: a single saturated
accent on near-neutral ground, two competing brand colours held apart by
generous white space, a dark-first site where the accent is the only light?
Name the ground, the ink, the accent, and where the accent is *forbidden* (a
rule like "the accent appears only on interactive elements" is worth more than
five extra hex codes).

Validate every foreground/background pairing against 4.5:1 **before** the
client picks. Discovering at verification that the brand blue fails at 3.5:1
means retro-fixing tokens across a finished build.

### 3. Layout system

The grid and its rhythm. A 12-column grid with wide gutters and asymmetric
content blocks reads very differently from a centred single column with
generous vertical rhythm, or an editorial split where imagery bleeds to one
edge. Say how sections *transition* — hard rules, colour blocks, overlapping
elements, nothing at all.

### 4. Motion personality

Motion is a voice. Describe it in adjectives and then in mechanics: "restrained
— content is present on load, and reveals are a 300ms 8px rise as sections
enter, nothing else moves" versus "kinetic — a parallax hero, a horizontal
scroll section, counters that count".

Whatever the personality, the mechanism is the same and is non-negotiable:
CSS-only reveals via `animation-timeline: view()` behind an `@supports` check,
so content is **visible by default** and animation layers on top. The worst
case must be "no animation", never "no content".

### 5. Signature moment

One thing this site does that no other site does, that comes from *this*
business. A funeral director's site that fades between seasons of the same
photographed churchyard. A structural engineer's homepage where the hero
headline is set on a working load diagram. A church site where the service
times block visually becomes the thing it describes.

The test: if you could paste the signature moment onto a different client's
site without changing it, it isn't a signature moment — it's a widget.

---

## How to make the three actually distinct

Vary the *premise*, not the parameters. Three directions that differ only in
accent colour are one direction.

A reliable spread:

- **One that leans on typography.** Almost no imagery, huge type, structure
  from rules and spacing. Works when the business sells expertise.
- **One that leans on imagery.** Full-bleed photography, type as caption,
  colour taken from the photographs. Works when the business sells a place, a
  product or a feeling — and only if real photography exists or is coming.
- **One that leans on structure or interaction.** A visible grid, a tool, a
  configurator, data made visual. Works when the business sells a process.

Then check the brief's *audience* line. A direction that would embarrass the
stated audience isn't a real option, so replace it rather than offering it as a
straw man.

---

## Named anti-patterns — do not ship these

Being able to point at what not to do is more reliable than describing
excellence. If a direction or a built page contains any of these, change it.

1. **Centred hero followed by three feature cards.** The default shape of every
   template on the internet. If three items genuinely need equal weight, find a
   different arrangement — a numbered list, a stepped diagonal, a table.
2. **Inter for everything.** Inter is an excellent UI face and a tell. It reads
   as "unstyled". See the font policy below.
3. **Identical rounded card grids.** Same radius, same shadow, same padding,
   repeated down the page. Vary the container, or drop containers entirely.
4. **Generic purple-blue gradients.** Also its cousins: the mesh gradient blob,
   the glowing orb behind the hero.
5. **Emoji as icons.** They render differently on every platform, they don't
   inherit colour, and they read as a placeholder. Use lucide-react, or an SVG
   set commissioned for the brand.
6. **Filler copy that reads like placeholder.** "Empowering businesses to
   unlock their potential." Nobody believes it, and it makes the whole page
   look unfinished. Write what the business would actually say, or leave a
   clearly-marked gap.

Adjacent smells worth catching: the stock-photo handshake, a testimonial
carousel with one testimonial in it, an "as seen in" strip of logos the client
has no relationship with, and a stat block with invented numbers.

---

## Font policy

**Fontshare is the default.** Free for commercial use, self-hostable, and
characterful enough to escape the default-Tailwind look. Start with Satoshi,
Clash Display, General Sans and Switzer. Self-hosting means no third-party
request on page load and no licence that can expire underneath a client.

Self-host by placing the woff2 files in `public/fonts/` and declaring
`@font-face` in the global stylesheet, with `font-display: swap`.

**Do not use `next/font/google`.** Google Fonts is blocked in the cloud
container, so it fails the build outright. If a Google face is genuinely
required, self-host the files or use a plain stylesheet `<link>`.

**Adobe Fonts — Alex's own properties only.** Available on his Creative Cloud
subscription. Web projects need no domain allowlist and there are no pageview
limits, but self-hosting is prohibited and a *client* site needs the client's
own Creative Cloud subscription — if the subscription lapses, every site using
the kit silently reverts to fallback fonts. That is why this is not the
recommended path. When it is used:

```tsx
// app/layout.tsx
<link rel="stylesheet" href="https://use.typekit.net/KITID.css" />
```

---

## Presenting the three

Keep it to roughly 150–250 words per direction, give each a memorable name
(clients refer back to names, not numbers), and end with a one-line note on
which you'd pick and why. Then ask: which of the three, and is there anything
from the other two worth grafting in?
