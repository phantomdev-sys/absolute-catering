import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

export const ROOT = path.resolve(import.meta.dirname, '..');
export const VERIFY_DIR = path.join(ROOT, '.verify');
export const BASE_URL = process.env.VERIFY_BASE_URL ?? 'http://localhost:3100';

export const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

/**
 * Enumerate routes by walking the app directory rather than keeping a list.
 * A hand-maintained route list drifts, and the page it forgets is reliably the
 * one that ships broken.
 *
 * Dynamic segments can't be enumerated statically, so they're reported for the
 * caller to expand from its own data. Silently skipping them would mean a
 * whole route family never gets verified.
 */
export async function findRoutes(dir = path.join(ROOT, 'app'), prefix = '') {
  const routes = [];
  const dynamic = [];

  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return { routes, dynamic };
  }

  for (const entry of entries) {
    if (entry.isFile() && /^page\.(tsx|jsx|ts|js)$/.test(entry.name)) {
      routes.push(prefix === '' ? '/' : prefix);
      continue;
    }
    if (!entry.isDirectory()) continue;

    const name = entry.name;
    if (name.startsWith('_') || name === 'api') continue;

    // Route groups (folder) don't appear in the URL.
    const segment = name.startsWith('(') && name.endsWith(')') ? '' : `/${name}`;
    const nested = await findRoutes(path.join(dir, name), `${prefix}${segment}`);

    if (name.includes('[')) {
      dynamic.push(`${prefix}${segment}`);
      continue;
    }

    routes.push(...nested.routes);
    dynamic.push(...nested.dynamic);
  }

  return { routes: [...new Set(routes)].sort(), dynamic };
}

/**
 * Launch Chromium.
 *
 * Locally, `npx playwright install` puts the matching build where Playwright
 * expects it. In a cloud session the container ships its own Chromium at a
 * version Playwright may not recognise, and downloading another one is both
 * slow and often blocked — so PLAYWRIGHT_CHROMIUM_PATH points at the one
 * that's already there:
 *
 *   PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium/chrome-linux/chrome npm run check:a11y
 */
export function launchBrowser() {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
  return chromium.launch(executablePath ? { executablePath } : {});
}

/**
 * Start `next start` on a dedicated port and resolve once it answers.
 *
 * The binary is invoked directly rather than through `npx`: killing an npx
 * wrapper leaves the real server orphaned, and the next run then finds the
 * port taken and quietly measures the *previous* build.
 *
 * Returns a stop function that kills the whole process group.
 */
export async function startServer() {
  const port = new URL(BASE_URL).port || '3100';
  const bin = path.join(ROOT, 'node_modules', '.bin', 'next');

  // Refuse to run against something already on the port. A stale server from
  // an earlier run serves the PREVIOUS build, every gate passes or fails
  // against code that no longer exists, and nothing in the output says so.
  try {
    await fetch(BASE_URL, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
    throw new Error(
      `Something is already listening on ${BASE_URL}. It is probably a server left over from an ` +
        'earlier run, and it is serving an older build — stop it before verifying.',
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Something is already listening')) {
      throw error;
    }
    // Nothing there: this is what we want.
  }

  const child = spawn(bin, ['start', '--port', port], {
    cwd: ROOT,
    stdio: 'ignore',
    env: process.env,
    detached: true,
  });

  const stop = () => {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      child.kill('SIGTERM');
    }
  };

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL, { method: 'HEAD' });
      if (res.status < 500) return stop;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  stop();
  throw new Error(`Server did not start on ${BASE_URL}. Run \`npm run build\` first.`);
}

/**
 * Navigate and let the page settle.
 *
 * Deliberately not `networkidle`: it is unreliable on a Next app (a stray
 * long-lived connection means it never fires) and a timeout there reads as
 * "the page is broken" when the page is fine. `load` plus a short settle is
 * both faster and honest about what it is waiting for.
 */
export async function visit(page, url) {
  await page.goto(url, { waitUntil: 'load', timeout: 30_000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(250);
}

export function reportHeader(title) {
  console.log(`\n${title}\n${'─'.repeat(title.length)}`);
}

export function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exitCode = 1;
}

export function pass(message) {
  console.log(`✓ ${message}`);
}
