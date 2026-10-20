import json, re, csv, sys
d = json.load(open(sys.argv[1])); att = {int(k): v for k, v in d["att"].items()}
rows, used = [], set()
def ext(u): return u.rsplit(".", 1)[-1].lower()
for p in d["prods"]:
    ids = [int(i) for i in ([p["thumb"]] + (p["gallery"] or "").split(",")) if i and i.isdigit()]
    for n, i in enumerate(ids):
        used.add(i); a = att[i]
        rows.append((a["url"], f"products/{p['slug']}{'' if n == 0 else '-' + str(n + 1)}.{ext(a['url'])}", i, f"product: {p['name']}"))
BRAND = {35: "favicon", 36: "favicon-cropped", 37: "logo", 38: "logo-cropped"}
SKIP = {6, 94}  # WooCommerce placeholder, Phantom's own favicon
for i, a in sorted(att.items()):
    if i in used or i in SKIP: continue
    fn = a["url"].split("/")[-1]; stem = fn.rsplit(".", 1)[0]
    if i in BRAND: dest = f"brand/{BRAND[i]}.{ext(fn)}"
    elif re.fullmatch(r"\d+", stem) or stem.startswith("Screenshot"): dest = f"unsorted/{i}-{fn}"
    else:
        clean = re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", stem.lower())).strip("-")
        clean = clean.replace("gluton", "gluten").replace("catagory", "category").replace("paltes", "plates").replace("chjanpaign", "champagne").replace("jajerbomb", "jagerbomb")
        dest = f"site/{clean}.{ext(fn)}"
    rows.append((a["url"], dest, i, "page" if a["parent"] == 18 else "site"))
dests = [r[1] for r in rows]; assert len(dests) == len(set(dests)), "duplicate names"
with open(sys.argv[2], "w", newline="") as f:
    w = csv.writer(f, delimiter="\t"); w.writerow(["url", "dest", "wp_attachment_id", "note"]); w.writerows(rows)
print(len(rows), "files:", {k: sum(r[1].startswith(k) for r in rows) for k in ["products/", "brand/", "site/", "unsorted/"]})
