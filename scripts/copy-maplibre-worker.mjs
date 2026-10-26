#!/usr/bin/env node
/**
 * MapLibre 6 runs map rendering in a web worker that it loads relative to its
 * own bundle, which Next's bundler moves. Copy the worker into public/ and the
 * delivery map points MapLibre at it with setWorkerUrl(). Runs before dev and
 * build; the copy is git-ignored.
 */
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = path.join(ROOT, 'node_modules/maplibre-gl');
const { version } = JSON.parse(readFileSync(path.join(pkg, 'package.json'), 'utf8'));
const out = path.join(ROOT, 'public/vendor/maplibre');
mkdirSync(out, { recursive: true });
copyFileSync(path.join(pkg, 'dist/maplibre-gl-worker.mjs'), path.join(out, `maplibre-gl-worker-${version}.mjs`));
console.log(`maplibre worker ${version} copied`);
