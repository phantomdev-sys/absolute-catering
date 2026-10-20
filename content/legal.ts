/**
 * The compliance set.
 *
 * These are drafted skeletons, not legal advice, and they are deliberately
 * full of visible gaps — a policy that reads as finished is a policy nobody
 * checks. Fill them from the client's own wording where it exists; existing
 * wording is always preferable to newly drafted wording.
 *
 * Decide these pages *with* the sitemap rather than bolting them on at the
 * end: a footer with three legal links designed in from the start looks
 * intentional, and one added last looks like an afterthought, because it is.
 *
 * See the site-build skill's references/compliance.md for what each sector
 * additionally needs.
 */

export const legal = {
  privacy: `
This notice explains how <business name> collects and uses personal data. It
needs completing before launch — the placeholders below are prompts, not
wording to ship.

## Who we are

<Registered name>, company number <number>, registered in <England and Wales>
at <registered office>. The data controller is <name>, contactable at <email>.

## What we collect and why

When you use the contact form we collect your name, email address and message,
so that we can reply to your enquiry. The lawful basis is <legitimate
interests / consent>.

## Who we share it with

<Hosting provider, email provider, CRM. Name them.>

## How long we keep it

<Retention period. This must match what actually happens to enquiries.>

## Your rights

You have the right to ask for a copy of your data, to have it corrected or
deleted, and to object to how it is used. To do any of that, contact <email>.

If you are unhappy with how we have handled your data you can complain to the
Information Commissioner's Office at [ico.org.uk](https://ico.org.uk).
`.trim(),

  terms: `
These terms govern use of this website. They need completing before launch.

## Using this site

The content here is provided for general information. We take care over it but
make no guarantee that it is complete or current.

## Intellectual property

The content and design of this site belong to <business name> unless stated
otherwise.

## Liability

<Standard limitation wording, appropriate to what the site actually does.>

## Governing law

These terms are governed by the law of <England and Wales>.
`.trim(),

  accessibility: `
We want this site to be usable by as many people as possible.

## What we aim for

This site aims to meet **WCAG 2.1 level AA**.

## How it was tested

<Fill in from the verification run: which routes, which viewports, which
tools. Only claim what was actually tested — an accessibility statement that
overclaims is worse than none at all.>

## Known issues

<List anything outstanding, with a rough timeline. An honest list builds more
trust than an empty one.>

## Telling us about a problem

If you find something on this site you can't use, please contact <email> and
we'll do what we can to put it right.
`.trim(),
} as const;
