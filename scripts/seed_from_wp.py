"""Turn the 20 Oct 2026 WooCommerce Store API dump into seed data and a 301 map.

Deliberately writes NO commercial or food-safety data: price, VAT, pack size,
ingredients and allergens are all null with a status flag, because they must
come from the client (allergens with a named sign-off). The one price found in
WooCommerce is kept as 'legacy_price_pence_unverified' for reference only.
"""
import csv, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DUMP = ROOT / "data/scrape/wp-dump-2026-10-20.txt"
WP_UPLOADS = "https://absolutecateringsupplies.com/wp-content/uploads/"

sections, cur = {}, None
for line in DUMP.read_text(encoding="utf-8").splitlines():
    if line.startswith("##"):
        cur = line.split()[0][2:]; sections[cur] = []; continue
    if line.strip():
        sections[cur].append(line.split("|"))

# Provisional aisle map from legacy top-level categories (taxonomy to be approved).
AISLE = {"fresh-food": "fresh", "frozen-food": "frozen", "gluten-free": "gluten-free",
         "household-packaging": "household", "seasonal": "seasonal", "plastic-cups": "household"}
cats = {}
for cid, name, slug, parent, count, path in sections["CATEGORIES"]:
    cats[int(cid)] = dict(legacy_id=int(cid), name=name, slug=slug, parent_id=int(parent),
                          legacy_product_count=int(count), legacy_path=path)
by_slug = {c["slug"]: c for c in cats.values()}
for c in cats.values():
    p = cats.get(c["parent_id"])
    c["parent_slug"] = p["slug"] if p else None

def clean_sub(slug):
    return re.sub(r"(^frozen-)|(-frozen-food$)", "", slug)

def new_cat_path(c):
    if c["slug"] == "absolute-range":
        return "/absolute-range"
    if c["parent_slug"] is None:
        a = AISLE.get(c["slug"], c["slug"])
        return f"/shop/{a}" if c["slug"] != "plastic-cups" else "/shop/household/plastic-cups"
    return f"/shop/{AISLE[c['parent_slug']]}/{clean_sub(c['slug'])}"

products = []
for pid, name, slug, path, catlist, images, price in sections["PRODUCTS"]:
    cl = catlist.split(",")
    aisles = sorted({AISLE.get(by_slug[s]["parent_slug"] or s) for s in cl} - {None})
    products.append(dict(
        legacy_wc_id=int(pid), slug=slug, name=name, legacy_path=path, new_path=f"/product/{slug}",
        legacy_categories=cl, aisles_provisional=aisles,
        own_brand="absolute-range" in cl,
        price_pence=None, vat_rate=None, pack_size=None, description=None,
        ingredients=None, allergens=None, allergen_signoff=None, sell_online=None,
        data_status="awaiting_client",
        legacy_price_pence_unverified=int(price) if price else None,
        image=dict(key=slug, status="placeholder_wp_screenshot",
                   placeholder_urls=[WP_UPLOADS + i for i in images.split()],
                   expected_drive_files=[f"{slug}-front.jpg", f"{slug}-back.jpg"]),
    ))

# 301 map. Product URLs are kept identical where possible (no redirect needed).
rows = []
for c in cats.values():
    rows.append((c["legacy_path"], new_cat_path(c), "301", f"category: {c['name']}"))
PAGE_MAP = {"/bacon/": "/shop/fresh/bacon", "/chicken/": "/shop/fresh/chicken",
  "/chicken-goujons/": "/shop/frozen/goujons", "/chips/": "/shop/frozen/chips",
  "/burgers/": "/shop/fresh/burgers", "/potato-cubes/": "/shop/frozen/potato-cubes",
  "/pre-cut-washed-potatoes/": "/shop/frozen/pre-cut-and-washed-potatoes",
  "/aluminium-foils/": "/shop/household/aluminium-foil", "/all-seasonal/": "/shop/seasonal",
  "/all-fresh-goods/": "/shop/fresh", "/all-frozen-goods/": "/shop/frozen",
  "/all-gluten-free/": "/shop/gluten-free", "/all-household-packaging/": "/shop/household",
  "/absolute-range/": "/absolute-range", "/shop/": "/shop", "/cart/": "/basket",
  "/checkout/": "/basket", "/my-account/": "/account", "/contact-us/": "/contact",
  "/about-us/": "/about", "/terms-conditions/": "/terms", "/privacy-policy-2/": "/privacy",
  "/privacy-policy/": "/privacy", "/home/": "/", "/sample-page/": "/"}
EMPTY = {"/pre-pack-dinners/": "/shop/fresh", "/ham/": "/shop/fresh", "/butter/": "/shop/fresh",
  "/cheese/": "/shop/fresh", "/chicken-chunks/": "/shop/frozen", "/foil-trays/": "/shop/household",
  "/plastic-food-wrap/": "/shop/household", "/christmas-props/": "/shop/seasonal",
  "/christmas-decorations/": "/shop/seasonal"}
for k, v in PAGE_MAP.items(): rows.append((k, v, "301", "WP page"))
for k, v in EMPTY.items(): rows.append((k, v, "301", "WP page with no products; repoint if a real category is created"))
# Legacy 'Pre-cut-washed-potatoes' capitalised link in the mega-menu
rows.append(("/Pre-cut-washed-potatoes/", "/shop/frozen/pre-cut-and-washed-potatoes", "301", "capitalised menu link"))
rows.append(("/product-category/*", "/shop", "301", "catch-all for any category not listed"))

(ROOT / "data/seed/products.json").write_text(json.dumps(products, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
(ROOT / "data/seed/legacy-categories.json").write_text(json.dumps(list(cats.values()), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
with open(ROOT / "data/redirects/redirects.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow(["from", "to", "status", "note"]); w.writerows(sorted(set(rows)))
print(len(products), "products;", len(cats), "categories;", len(set(rows)), "redirects")
print("own-brand:", sum(p["own_brand"] for p in products), "| multi-image:", sum(len(p["image"]["placeholder_urls"])>1 for p in products))
print("no aisle:", [p["slug"] for p in products if not p["aisles_provisional"]])
