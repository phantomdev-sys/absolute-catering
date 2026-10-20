# Absolute Catering Supplies — Project Brief & Context

**Client:** Absolute Catering Supplies — 23D Gortrush Industrial Estate, Omagh, BT78 5EJ
**Live site:** https://absolutecateringsupplies.com/
**Developer:** Alex Nelson, Phantom Development (alex@phantomdevelopment.uk)
**Compiled:** 20 October 2026, from Claude chats (20 Aug, 8–22 Sept), memory, Gmail and Google Drive

---

## 1. THE GOAL (new brief — 20 Oct 2026)

We are re-building https://absolutecateringsupplies.com/ from the ground up using Claude Code. The website will be a dramatic improvement on what is already there.

- **E-commerce**, linked to the client's **Stripe** account (we can set it up for them).
- UI built with assets made specifically for e-commerce stores from **21st.dev**, via the Claude Code connector (already connected).
- **All products already on the website** must be uploaded and used.
- **Product images** come from a Google Drive link the client is populating (link TBC from Alex).
- **Customer accounts** — log in / create account, saved addresses and purchase history.
- **Tesco-grade shopping experience** — add to basket, buy again, newsletter sign-up, and the other best features of the big grocers.
- **Delivery slot booking** (slot details TBC).
- **Delivery only within a 30-mile radius** of the Absolute Catering store. Outside that radius customers can still buy, but must **collect from the store**.
- **Click & collect** — customers book a collection date and time.
- Build lives in a new **absolute-catering** folder inside the **Website Builds** folder on Alex's desktop, with its own repo.
- Client accepts that this build means **Phantom controls updates**, and is happy to set up a **retainer** for that.
- First Phantom e-commerce site built with Claude Code — it has to be **showcase quality**, to the standard of Sainsbury's and Tesco.
- Alex will supply anything needed (current WP media library, etc.) on request.

---

## 2. CLIENT & CONTACTS

| Who | Role | Contact |
|---|---|---|
| **Ciaran** | Owner's son, day-to-day contact, decision-maker on the site | WhatsApp (main channel) |
| **Noel Carlin** | Owner (Ciaran's father), handles payments | noel@absolutecateringsupplies.com · 02882 248104 |

- Local food wholesale/retail outlet ("a mini Tesco"), well known locally for quality produce.
- Alex met both in person on **16 Sept 2026**.
- Careful with the email address: a message to `neol@` bounced on 20 Aug. It's **noel@**.

---

## 3. HISTORY

- **Nov 2025:** Alex built the current site for **£1,200**. It runs WordPress + WooCommerce in **catalogue-only mode**, with the shop switched off at Ciaran's request. It has brought in plenty of local enquiries.
- **Feb 2026:** Training videos recorded for the client and stored in Drive ("Editing Text & Images On Website.mov", "Adding Products.mov").
- **Aug 2026:** Ciaran called. A local competitor has closed, so he wants online ordering with Tesco-style delivery slots, limited to a radius around Omagh. Refrigerated van delivery only, no national shipping. He raised the idea of a retainer.
- **Hosting/maintenance at £35/month was never billed.**

### Audit of the current site (20 Aug)
- Categories: Absolute Range, Frozen, Fresh, Household, Gluten Free, Seasonal. An early scrape counted 85 products; the WooCommerce admin later confirmed **56 products** loaded.
- No prices. Every button says "Read more". Descriptions only repeat the product name.
- Product images are macOS screenshots (e.g. `Screenshot-2025-12-17-at-18.25.32.png`). There is no proper photography to build on.
- The Christmas hero was still up in August. A copy block is duplicated ("Product Of The Month" text repeated).
- The mega-menu points at top-level slugs (`/bacon`, `/chicken`) but products live under `/product-category/...`. **Set up 301 redirects from the old URLs on rebuild.**
- An SSL "Not Secure" flag showed in the admin. Check it before anything payment-related goes near the domain.

---

## 4. WHAT WAS QUOTED AND AGREED (Sept 2026)

The 8 Sept quote was emailed to Ciaran and Noel on 9 Sept and **verbally accepted in person on 16 Sept**.

| Tier | Price |
|---|---|
| Essential | £2,800 |
| **Complete (agreed)** | **£3,900** |
| Complete + Launch | £4,750 |

- **Payment terms:** 50% deposit, 50% on launch. Deposit invoice **ABS-CAT-WEB160926 = £1,950**, no VAT. Phantom never publishes before the balance is paid.
- **Hosting:** £85/month from go-live, *replacing* the £35. Not backdated.
- **Optional care plan:** £300/month (seasonal changes, promotions, product updates, support).
- **Extra work outside scope:** £45/hr standard, £75/hr advanced.
- **Product cap:** 120 products, supplied as one batch before go-live.
- **Timeline:** product data due mid-October (data sheet deadline **Fri 16 Oct 2026**), go-live **mid-November 2026**, ahead of Christmas.

### Scope as quoted
The quote assumed **switching on WooCommerce on the existing WordPress site**: Stripe payments, a postcode-based delivery zone, delivery slots through **Iconic WooCommerce Delivery Slots**, printed picking lists for the van, policy pages and a storefront refresh.

### Assumptions written into the quote
- All products are **prepacked at fixed prices**. Nothing is sold by weight.
- **No EPOS/till system**, so stock does not sync. Out-of-stocks are handled manually at picking: staff contact the customer and refund that line.
- **All customers pay by card at checkout.** No trade accounts, credit terms or tiered pricing.
- Local van delivery only. No couriers.
- The client supplies prices, descriptions, allergens and photography. Image rights rest with the client: manufacturer images used with permission are fine, Google results and competitor sites are not.

### Not included in the quote
Photography, writing descriptions, sourcing or verifying allergen data, EPOS integration, trade accounts, variable-weight products, couriers, SEO/ads/social/email marketing, and a mobile app.

---

## 5. ⚠️ HOW THE NEW BRIEF DIFFERS FROM THE AGREED QUOTE

The 20 Oct brief is a bigger job than the £3,900 Complete package. **Agree the commercial side with Ciaran before building past what was quoted.**

| Area | Agreed quote (Sept) | New brief (Oct) |
|---|---|---|
| Platform | Existing WordPress/WooCommerce | Full custom rebuild in Claude Code |
| Delivery area | Postcode-based zone | 30-mile radius check, with collection fallback |
| Collection | Not scoped | Click & collect with booked date/time slots |
| Accounts | WooCommerce default | Saved addresses, purchase history, buy-again |
| Extras | — | Newsletter and Tesco-style features |
| Updates | Client staff trained to do their own | Phantom controls updates on a retainer |

Points to decide:
- **Fee:** confirm whether £3,900 stands, or whether a variation or rebuild uplift is needed for the custom build.
- **Retainer:** set the level. The quote offered a £300/month care plan, and £1,000/month was mentioned back in August. With Phantom doing all updates, the higher end is easier to justify.
- **Hosting:** £85/month was priced for WooCommerce. Re-check it against the new stack (Vercel, Supabase, Stripe).
- **Hosting/retainer amount:** discussed with the client. **Final figure still TBC.** (Background: Alex's WhatsApp said £85 included social media and product updates, which the quote didn't.)
- **Deposit:** ✅ **PAID** (£1,950, ABS-CAT-WEB160926). Work is clear to proceed.
- **Platform history:** in August, Claude recommended Shopify + Zapiet over a bespoke build, because it keeps payments, stock and refunds on managed infrastructure. The quote then went with WooCommerce. The new brief chooses custom. That's fine, but Phantom now owns checkout, order management and uptime, which is what the retainer and hosting fee need to cover.

---

## 6. LEGAL & COMPLIANCE (go-live blockers)

- **Allergens:** UK food labelling rules and **Natasha's Law** require allergen information for every product before purchase. It must come from the client, with a **named person's written sign-off**. Don't guess any allergen data.
- **Ingredients:** distance-selling rules require them before purchase. The easiest route is a photo of the back of each pack.
- **VAT:** most food is zero-rated, but confectionery, crisps, soft drinks and similar are standard-rated. Set a VAT rate per product and confirm it with Ciaran.
- **Image copyright:** only use client-owned or permissioned images.
- **Policy pages:** delivery, collection, refunds/substitutions, privacy, cookies and T&Cs.

---

## 7. PRODUCT DATA & ASSETS

- **Product data sheet** (simplified version, built 22 Sept). Columns: Product, Price (shelf price inc. VAT), Pack size, Description, Allergens (as on the label), Sell online Y/N, Notes. A hidden WooCommerce ID column supports import matching. A second tab has six delivery questions and the allergen sign-off. It was due back **16 Oct**. Check whether it was ever shared and returned.
- **Google Drive:**
  - **Product photography folder (client uploads here):** https://drive.google.com/drive/folders/15uDeOgFOalgW-_ZHNO0R0XIVsiUlNFxJ. The client is filling it from **21 Oct 2026** with front-of-pack and back-of-pack (ingredients/allergens) photos.
  - **Until then, build with placeholders:** use the existing product images from the current WP site, or neutral filler images where none exist. Keep image handling swappable (product image keyed by product ID/slug) so the real photos drop straight in later.
  - `Absolute Catering` folder (alexandersnelson@gmail.com) containing the two training videos.
  - `Absolute Catering Quotation` Google Doc (Nov 2025, original build) and `Absolute Catering INVOICE BALANCE.pdf` (Dec 2025).
- **From the current WP site, needed for the rebuild:** WooCommerce product CSV export (ID, name, category, images) and the media library.

---

## 8. DISCOVERY QUESTIONS STILL OPEN

- Delivery slots: days, times, capacity per slot, order cut-off, blackout dates.
- Delivery charge and minimum order value. Does the charge vary by distance?
- Collection slots: hours and capacity.
- 30 miles measured as straight line or driving distance? (Suggest straight line from the store's coordinates via postcode geocoding, with postcodes on the edge reviewed by hand.)
- Who is the single named contact for product data?
- Stripe: new account or existing? Which business email?
- Newsletter platform (Resend, Mailchimp, Colabr8?).
- Order notifications: who receives them, and in what format (email, printed picking list)?
- How large is the full range compared with the 56 products online, and is the 120-product cap still right?
- Trade customers: any credit accounts or tiered pricing? (This was the question most likely to change the spec. The answer so far is no.)

---

## 9. ORIGINAL PHASING ADVICE (still relevant)

- **Phase 1:** a transactional launch with the core range: payments, slots, radius check, collection, accounts and order management.
- **Phase 2 (retainer):** expand the full catalogue as the client supplies data and photography.
- Mid-November is only realistic if the product data lands on time. If it slips, the launch slips with it, and that should be said to the client up front.

---

## 10. NEXT ACTIONS

1. ~~Confirm deposit~~ ✅ Paid.
2. Finalise the hosting/retainer figure with Ciaran (TBC). Confirm the fee for the custom rebuild scope.
3. Export the WooCommerce products CSV and the WP media library. Use the current images as placeholders.
4. Set up the repo and the `Website Builds/absolute-catering` folder, then scaffold the stack (Next.js + Supabase + Stripe on Vercel, with 21st.dev components).
5. Swap in the real photos from the Drive folder once the client uploads them (from 21 Oct).
6. Collect prices and the allergen sign-off. Write descriptions from the back-of-pack photos.
7. Work through the open discovery questions in §8 with Ciaran.
