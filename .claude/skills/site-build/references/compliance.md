# Compliance checklist

Read this at Phase 4, when the sitemap is being decided, and again at Phase 6.

**This is a working checklist, not legal advice.** It reflects UK requirements
as generally understood and is here so nothing is forgotten — not so a lawyer
isn't needed. Anything that carries real risk (regulated sectors, children,
health claims, payments) should be confirmed by the client's own solicitor or
regulator, and you should say so plainly in the handoff rather than implying
the site is signed off.

Compliance pages get decided *with the sitemap*, not bolted on afterwards. A
footer with three legal links designed in from the start looks intentional; one
added at the end looks like an afterthought, because it is.

---

## Every site

### Business identification

**A UK limited company is legally required to display, on its website:**

- the full registered company name, exactly as registered
- the company registration number
- the place of registration (England and Wales, Scotland, or Northern Ireland)
- the registered office address

This is a legal requirement under the Companies Act, not a nicety. It's usually
put in the footer or on a dedicated legal page linked from the footer. LLPs
have equivalent obligations. A sole trader doesn't have a company number but
still needs a business address for consumer-facing trade — a PO box or "London,
UK" is not sufficient where a geographic address is required.

If the site charges VAT, the VAT number goes here too.

Get these details from the brief. **Do not invent or infer a company number** —
if it isn't in the brief, log it as a blocking open item.

### Privacy notice

Required wherever personal data is collected, which in practice means any site
with a contact form. It needs to say: who the data controller is and how to
contact them, what data is collected, why, the lawful basis, who it's shared
with, how long it's kept, and the individual's rights including the right to
complain to the ICO.

If the business processes personal data on any meaningful scale it likely needs
to be **registered with the ICO** and pay the data protection fee. Worth asking
about; frequently missed by small businesses.

### Cookie / tracking notice

If — and only if — the site sets non-essential cookies or loads third-party
trackers. Under PECR, non-essential cookies need **consent before they are
set**, not a banner that informs after the fact.

The cheapest compliance is to not need it: no analytics, or privacy-preserving
analytics that set no cookies, plus click-to-load video facades so YouTube sets
nothing until a visitor presses play. Raise this with the client — many accept
losing granular analytics once the alternative is a consent banner.

If a consent tool is needed, it must genuinely block scripts before consent,
and reject must be as easy as accept.

### Accessibility statement

Legally required for public sector bodies. Good practice for everyone, and a
useful record of what was tested. It should state the standard aimed at (WCAG
2.1 AA), what was tested and how, any known issues, and how to report a
problem.

Only claim what verification actually demonstrated. An accessibility statement
that overclaims is worse than none.

### Terms of use

Sensible for any site; necessary once the site does something — accounts,
bookings, downloads, e-commerce.

### Contactability

Consumer-facing businesses need a way to be contacted that isn't only a form:
an email address or a phone number. A form alone is not enough under consumer
information requirements.

---

## By sector

### Anything involving children or vulnerable adults

- A published **safeguarding policy**, and a named safeguarding lead with
  contact details.
- Explicit rules about photography of children: consent held, and a stated
  process for removal on request. Where consent isn't held for a photograph, it
  doesn't go on the site — this is the single most common problem.
- Where children can submit anything (a form, a sign-up), age-appropriate
  design considerations apply and parental consent may be needed.
- DBS status of relevant staff, if that's normal for the sector.

### Financial services

Regulated activity requires FCA authorisation, and authorised firms must carry
a specific statutory disclosure with their FRN. Financial promotions must be
"clear, fair and not misleading" and carry the right risk warnings. **Do not
draft this wording** — the client's compliance function supplies it verbatim.

### Healthcare, medical, therapy

Advertising restrictions are strict and sector-specific (CQC registration
display, professional body rules, restrictions on advertising prescription-only
medicines, and rules on before-and-after imagery). Claims about outcomes need
substantiation. Get the client's professional body's guidance and follow it.

### Charities and churches

- Registered charity number displayed, and for charitable companies the
  registered company details as well.
- Where a charity is above the income threshold, the number must appear on all
  documents that solicit money — the website included.
- Fundraising must follow the Code of Fundraising Practice.
- Gift Aid claims need the right declaration wording.
- Safeguarding, per above, wherever there is contact with children.

### E-commerce

Consumer contract rules: pre-contract information, a 14-day cancellation right
with a model cancellation form, delivery timescales, total price including
taxes and delivery, and a returns policy. Payment security is the payment
provider's remit — don't hand-roll card handling.

### Employment / recruitment pages

Job adverts must avoid discriminatory wording, and applicant data is personal
data with its own retention period. Say what it is.

---

## Advertising claims — any sector

The CAP Code applies to website copy. Claims must be capable of substantiation:
"the leading supplier in Yorkshire", "trusted by 500 businesses", "award
winning" all need evidence held by the client. Testimonials must be genuine and
attributable, and the client must hold the correspondence.

Practically: **never invent a statistic, a testimonial, an award or a client
logo, even as placeholder.** Placeholder claims have a habit of surviving to
launch. If a stat block is part of the design, leave the numbers visibly blank
and log it.

---

## What to hand over

In the handoff, state:

- which compliance pages were built and from whose wording
- which details came from the brief and which are still missing
- anything you flagged that the client needs to confirm with a professional

Log every unresolved item in `briefs/OPEN-ITEMS-REGISTER.md` rather than in
prose — prose gets skimmed, the register gets worked through.
