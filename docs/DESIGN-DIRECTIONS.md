# Design directions

20 Oct 2026 · Awaiting Alex's pick. Words only, no mockups (site-build Phase 3).

## Brand colours, measured from the current logo

| Token | Hex | On white | Use |
|---|---|---|---|
| Plum (logo) | #612F6D | 10.2:1 | Brand voice: headings, header/footer bands, own-brand |
| Teal (logo) | #60C4CA | **2.1:1, fails** | Fills and accents only, always with dark ink on it (8.3:1) or on plum (4.86:1). Never text on white |
| Deep teal (derived) | #00747C | 5.5:1 | Interactive: buttons, links, add-to-basket |
| Paper | #F6F3EE | — | Warm ground; plum 9.2:1, deep teal 5.0:1 on it |

Fonts: Fontshare, self-hosted (no Google Fonts, no Inter).

## A · Shelf Label (typography-led)

**Premise:** the shop's own white own-label stickers (see `range/absolute-range-pizza-snacks-shows-price.png`): shop name, product, price, allergens in bold. The site borrows that language.

- **Type:** Cabinet Grotesk at heavy weights for aisle and product names; Switzer for body, with tabular figures so prices, weights and pack sizes line up. A tight, documentary scale: hierarchy comes from weight and hairline rules, not size jumps.
- **Colour:** paper ground, near-black ink, plum for brand moments and Absolute Range, deep teal only on things you can press. Logo teal never carries text.
- **Layout:** 12-column grid, products separated by ruled lines rather than boxed cards, like a label sheet.
- **Motion:** restrained. 8px/300ms reveals, a tick on the quantity stepper, a bump on the basket count. Nothing else moves.
- **Signature:** every product page's allergen and ingredients panel is set as the back-of-pack label, allergens in bold. It's the compliance requirement made into the brand. Absolute Range items get the white sticker treatment.

## B · Within 30 Miles (structure-led)

**Premise:** the delivery promise is the organising idea. Every visitor's first question is "will you deliver to me?", so the site answers it before anything else.

- **Type:** Clash Display for confident, compressed headings; Satoshi for body and UI.
- **Colour:** plum header and footer bands with logo teal as the light accent on them; white working area; deep teal for actions.
- **Layout:** Tesco-dense and practical. A persistent delivery bar under the header ("Delivering to BT78 · next slot Thu 9–11am"), a sticky basket rail on desktop with minimum-order progress, and the slot grid as a first-class component.
- **Motion:** functional only. The progress bar fills, slots grey out as they book, the basket rail slides. No decorative movement.
- **Signature:** the homepage hero is a drawn 30-mile ring around Omagh, with real towns plotted from coordinates and the van photo. Type a postcode and a pin drops inside or outside the ring, which tells you straight away whether it's delivery or collect.

## C · Open to the Public (imagery-led)

**Premise:** the shop as a place you know: the aisles, the freezer run, the van, the Christmas stock.

- **Type:** Gambetta (a warm serif) for display; General Sans for body.
- **Colour:** taken from the photography; paper ground, plum headings, teal used sparingly.
- **Layout:** editorial split, with photography bleeding to one edge. Each aisle page opens on a photo of that real aisle.
- **Motion:** slow and warm. Image crossfades, 400ms reveals.
- **Signature:** "Walk the aisles". The navigation follows the physical shop at Gortrush, aisle by aisle.
- **Caveat:** this needs a half-day photo shoot. The current store photos are 800–2,000px phone shots, the Drive photos will be packshots, and photography isn't in the quote. Without a shoot, this direction looks cheaper, not better.

## Recommendation

**B as the base, with A's label treatment for product pages and the allergen panel.** It's an online grocer: practicality wins, and the radius ring answers the first question every visitor has in a way no other site could. C is the retainer upgrade once a shoot is booked.
