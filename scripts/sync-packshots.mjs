#!/usr/bin/env node
/**
 * Rebuilds content/packshots.json from the files in public/images/packshots/.
 *
 * Drop the client's Drive photos in as <slug>-front.webp / <slug>-back.webp
 * (any of webp, jpg, png) and run `npm run packshots`. Products with a front
 * image switch from the neutral placeholder automatically; a back-of-pack
 * image appears beside the ingredients panel. Extra angles go in as
 * <slug>-extra-1.webp, -extra-2.webp … and show as a small gallery.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(ROOT, 'public/images/packshots');
const manifest = {};
for (const file of readdirSync(dir)) {
  const m = file.match(/^(.+)-(front|back|extra-\d+)\.(webp|jpe?g|png)$/i);
  if (!m) continue;
  const [, slug, side] = m;
  manifest[slug] ??= {};
  const url = `/images/packshots/${file}`;
  if (side.toLowerCase().startsWith('extra')) (manifest[slug].extra ??= []).push(url);
  else manifest[slug][side.toLowerCase()] = url;
}
for (const shot of Object.values(manifest)) shot.extra?.sort();
writeFileSync(path.join(ROOT, 'content/packshots.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`${Object.keys(manifest).length} products have packshots`);
