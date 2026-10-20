#!/usr/bin/env bash
# Downloads the current WordPress media library into media/wp-library/, renamed
# by product slug (see data/wp-media/wp-media-manifest.tsv). Run from the
# project root on a machine that can reach the live site. Safe to re-run:
# files already downloaded are skipped.
set -u
cd "$(dirname "$0")/.."
manifest="data/wp-media/wp-media-manifest.tsv"
out="media/wp-library"
ok=0; skip=0; fail=0
while IFS=$'\t' read -r url dest id note; do
  [ "$url" = "url" ] && continue
  target="$out/$dest"
  if [ -s "$target" ]; then skip=$((skip+1)); continue; fi
  mkdir -p "$(dirname "$target")"
  if curl -fsSL --retry 2 -o "$target" "$url"; then ok=$((ok+1)); else fail=$((fail+1)); echo "FAILED: $url"; rm -f "$target"; fi
done < "$manifest"
echo "Downloaded $ok, skipped $skip, failed $fail (of $(($(wc -l < "$manifest") - 1)))"
