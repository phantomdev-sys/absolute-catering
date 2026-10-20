#!/usr/bin/env node
/**
 * Validate the brand palette against WCAG 2.1 AA contrast ratios.
 *
 * Run this the moment a palette is chosen — Phase 3, before a single component
 * is built. Retro-fixing tokens that come in at 3.5:1 after a site is finished
 * means touching every component; changing them before anything is built is a
 * five-minute conversation with the client about a slightly darker blue.
 *
 * Tokens are read from app/globals.css (@theme), and the pairings to check are
 * read from the `@contrast` comment block in the same file — so there is one
 * source of truth, and adding a pairing is a one-line edit next to the colours
 * it concerns.
 *
 * No dependencies: this needs to run before anything is installed.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, reportHeader, fail, pass } from './lib.mjs';

const CSS = path.join(ROOT, 'app', 'globals.css');

function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function parseHex(hex) {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

function contrast(a, b) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

const css = await readFile(CSS, 'utf8');

// --- tokens ---------------------------------------------------------------
const tokens = new Map();
const themeBlock = /@theme\s*\{([\s\S]*?)\n\}/.exec(css);
if (!themeBlock) {
  fail('No @theme block found in app/globals.css.');
  process.exit(1);
}
for (const match of themeBlock[1].matchAll(/--color-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)) {
  const rgb = parseHex(match[2]);
  if (rgb) tokens.set(match[1], { hex: match[2], rgb });
}

// --- pairings -------------------------------------------------------------
const contrastBlock = /@contrast[\s\S]*?\*\//.exec(css);
if (!contrastBlock) {
  fail('No `@contrast` comment block found in app/globals.css. Add one listing the pairings to check.');
  process.exit(1);
}

const pairings = [];
for (const line of contrastBlock[0].split('\n')) {
  const match = /^\s*\*?\s*([a-z0-9-]+)\s+on\s+([a-z0-9-]+)\s*:\s*([\d.]+)\s*$/.exec(line);
  if (match) pairings.push({ fg: match[1], bg: match[2], min: Number(match[3]) });
}

reportHeader(`Contrast — ${pairings.length} pairing(s), ${tokens.size} colour token(s)`);

if (pairings.length === 0) {
  fail('The @contrast block lists no pairings. Every foreground/background combination in the design needs a line.');
  process.exit(1);
}

let failures = 0;

for (const { fg, bg, min } of pairings) {
  const foreground = tokens.get(fg);
  const background = tokens.get(bg);

  if (!foreground || !background) {
    fail(`Unknown token in pairing "${fg} on ${bg}" — check the names against @theme.`);
    failures += 1;
    continue;
  }

  const ratio = contrast(foreground.rgb, background.rgb);
  const rounded = Math.round(ratio * 100) / 100;
  const label = `${fg} (${foreground.hex}) on ${bg} (${background.hex})`;

  if (ratio >= min) {
    pass(`${label} — ${rounded}:1 (needs ${min}:1)`);
  } else {
    fail(`${label} — ${rounded}:1, below the required ${min}:1`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(
    `\n${failures} pairing(s) failed.\n` +
      'Do not quietly darken a brand colour to make this pass. Tell the client, and\n' +
      'propose a compliant text variant that sits alongside the original — the brand\n' +
      'colour stays for large display use and fills.\n',
  );
  process.exit(1);
}

console.log('\nAll pairings pass.\n');
