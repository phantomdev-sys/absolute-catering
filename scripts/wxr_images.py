import sys, json, re, xml.etree.ElementTree as ET
ns = {"wp": "http://wordpress.org/export/1.2/", "content": "http://purl.org/rss/1.0/modules/content/"}
root = ET.parse(sys.argv[1]).getroot()
items = root.find("channel").findall("item")
att, prods, pages = {}, [], []
for it in items:
    t = it.findtext("wp:post_type", namespaces=ns)
    pid = int(it.findtext("wp:post_id", namespaces=ns))
    meta = {m.findtext("wp:meta_key", namespaces=ns): m.findtext("wp:meta_value", namespaces=ns) for m in it.findall("wp:postmeta", ns)}
    if t == "attachment":
        att[pid] = dict(id=pid, url=it.findtext("wp:attachment_url", namespaces=ns), title=it.findtext("title"),
                        parent=int(it.findtext("wp:post_parent", namespaces=ns) or 0), alt=meta.get("_wp_attachment_image_alt"))
    elif t == "product":
        prods.append(dict(id=pid, slug=it.findtext("wp:post_name", namespaces=ns), name=it.findtext("title"),
                          status=it.findtext("wp:status", namespaces=ns), thumb=meta.get("_thumbnail_id"),
                          gallery=meta.get("_product_image_gallery"), price=meta.get("_price"), sku=meta.get("_sku"),
                          weight=meta.get("_weight")))
    elif t == "page":
        pages.append((pid, it.findtext("wp:post_name", namespaces=ns), it.findtext("wp:status", namespaces=ns)))
json.dump(dict(att=att, prods=prods, pages=pages), open(sys.argv[2], "w"), indent=1)
used = set()
for p in prods:
    ids = [p["thumb"]] + (p["gallery"] or "").split(",")
    p["img_ids"] = [int(i) for i in ids if i and i.isdigit()]
    used.update(p["img_ids"])
print("products", len(prods), "statuses", {s: sum(p["status"] == s for p in prods) for s in {p["status"] for p in prods}})
print("no thumb:", [p["slug"] for p in prods if not p["thumb"]])
print("gallery extras:", sum(len(p["img_ids"]) - 1 for p in prods if p["img_ids"]))
print("prices:", [(p["slug"], p["price"]) for p in prods if p["price"]], "skus:", sum(bool(p["sku"]) for p in prods), "weights:", sum(bool(p["weight"]) for p in prods))
print("attachments", len(att), "used by products", len(used & set(att)), "missing", sorted(used - set(att)))
others = [a for a in att.values() if a["id"] not in used]
print("non-product media:", len(others)); [print("  ", a["id"], a["url"].split("/uploads/")[-1], "| parent", a["parent"]) for a in others]
