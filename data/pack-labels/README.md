# Pack labels from the client's photos

Source: Drive folder "Absolute Catering - Photography" (112 photos uploaded by Ciaran on 23 Oct 2026). Processed 26 Oct 2026.

- `labels.json`: for each product, the text read off the pack photos: name, brand, pack size, storage, ingredients, allergy advice, the price on the shop sticker, other facts, and the Drive file IDs used. **Unverified.** It was read by Claude from photos and has not been checked against the packs. It never feeds the confirmed `ingredients`/allergen fields. The product page shows it only as "from the pack photo", under a disclaimer.
- `descriptions.json`: a short factual description per product, written only from facts printed on the pack. Database descriptions override these.
- `info-needed.csv`: every product (old site + new) with what's still missing. Share this with Ciaran as the to-do list.
- `review.json`: images worth reshooting, the 8 Rosie & Jim back panels that couldn't be matched to a product (identical brand panel, no product name), and new products that may duplicate an old-site product.

Packshots are in `public/images/packshots/` as `<slug>-front.webp`, `-back.webp` and `-extra-N.webp`. They are 1200px squares on white: the product is cut out of the black photobox and its pixels are not recoloured. Run `npm run packshots` after adding or replacing any.

Sticker prices are recorded for convenience only. They are not prices until Ciaran confirms them.
