#!/usr/bin/env node
/**
 * Rebuilds content/packshots.json from the files in public/images/packshots/.
 *
 * Drop the client's Drive photos in as <slug>-front.webp / <slug>-back.webp
 * (any of webp, jpg, png) and run `npm run packshots`. Products with a front
 * image switch from the neutral placeholder automatically; a back-of-pack
 * image appears beside the ingredients panel. Extra angles go in as
 * <slug>-extra-1.webp, -extra-2.webp … and show as a small gallery.
 *
 * Every URL carries ?v=<hash of all the image files>, also written to
 * content/packshots-version.json for next.config's images.localPatterns. Swap
 * a photo under the same name and the version changes, so neither the browser
 * nor the image optimiser can keep serving the old one.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(ROOT, 'public/images/packshots');
const files = readdirSync(dir).sort();
const hash = createHash('sha1');
for (const file of files) hash.update(file).update(readFileSync(path.join(dir, file)));
const version = hash.digest('hex').slice(0, 10);
const manifest = {};
for (const file of files) {
  const m = file.match(/^(.+)-(front|back|extra-\d+)\.(webp|jpe?g|png)$/i);
  if (!m) continue;
  const [, slug, side] = m;
  manifest[slug] ??= {};
  const url = `/images/packshots/${file}?v=${version}`;
  if (side.toLowerCase().startsWith('extra')) (manifest[slug].extra ??= []).push(url);
  else manifest[slug][side.toLowerCase()] = url;
}
for (const shot of Object.values(manifest)) shot.extra?.sort();
writeFileSync(path.join(ROOT, 'content/packshots.json'), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(path.join(ROOT, 'content/packshots-version.json'), JSON.stringify({ version }, null, 2) + '\n');
console.log(`${Object.keys(manifest).length} products have packshots`);
