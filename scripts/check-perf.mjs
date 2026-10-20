#!/usr/bin/env node
/**
 * Performance budget, measured against the production build.
 *
 * These are marketing sites; one carrying much JavaScript beyond the framework
 * baseline has almost always reached for a client component where a server one
 * would have done. When a budget is exceeded the cause is usually one of three
 * things: an unnecessary "use client", an image that never went through
 * next/image, or a library imported for one function.
 */
import { visit, launchBrowser, findRoutes, startServer, BASE_URL, reportHeader, fail, pass } from './lib.mjs';

/**
 * Sizes are compressed transfer bytes, measured on a cold cache per route.
 *
 * `jsPerRoute` is set relative to the framework floor, not plucked from the
 * air: a bare Next 16 + React 19 App Router page transfers ~135 kB of
 * JavaScript before any of your code exists. A 130 kB budget — a perfectly
 * reasonable-sounding number — is therefore unachievable, and an unachievable
 * gate is one people learn to ignore.
 *
 * So the allowance below is the floor plus about 35 kB of headroom. The number
 * worth watching is the *delta* between routes: if one page is 40 kB heavier
 * than its neighbours, that page has a client component or a library the
 * others don't.
 *
 * Re-measure the floor after a major Next or React upgrade.
 */
const BUDGET = {
  jsPerRoute: 170 * 1024,
  largestImage: 300 * 1024,
  homepageTotal: 1024 * 1024,
  fontFiles: 4,
};

const kb = (bytes) => `${Math.round(bytes / 1024)} kB`;

const { routes } = await findRoutes();
// Launch the browser BEFORE starting the server. If the launch throws — a
// missing Playwright binary is the usual cause — a server started first is
// left running with nothing to stop it, and the next run aborts on a busy port.
const browser = await launchBrowser();
const stop = await startServer();

reportHeader('Performance budget');

try {
  for (const route of routes) {
    // A fresh context per route, so each is measured on a cold cache. Reusing
    // one context makes every route after the first report ~0 kB of
    // JavaScript, because the shared chunks are already cached — which reads
    // as a wonderfully fast site and measures nothing at all.
    const context = await browser.newContext();
    const page = await context.newPage();

    let js = 0;
    let total = 0;
    let largestImage = 0;
    let fontFiles = 0;

    const pending = [];

    // requestfinished, not response: sizes() is only meaningful once the body
    // has transferred, and responseBodySize is the COMPRESSED size actually
    // sent over the wire. Measuring uncompressed bytes instead roughly
    // quadruples every number and makes any sensible budget look breached.
    page.on('requestfinished', (request) => {
      pending.push(
        (async () => {
          try {
            const { responseBodySize } = await request.sizes();
            const type = request.resourceType();

            // Playwright reports -1 when the size is unknown (served from
            // cache, or a request it couldn't measure). Clamping rather than
            // adding it is the difference between a real number and a report
            // of "-2 kB", which is how this was caught.
            const size = Math.max(0, responseBodySize);

            total += size;
            if (type === 'script') js += size;
            if (type === 'image') largestImage = Math.max(largestImage, size);
            if (type === 'font') fontFiles += 1;
          } catch {
            // redirects and served-from-cache requests have nothing to measure
          }
        })(),
      );
    });

    await visit(page, new URL(route, BASE_URL).toString());
    await Promise.all(pending);

    const label = route === '/' ? '/ (homepage)' : route;
    const checks = [
      [`JS ${kb(js)}`, js <= BUDGET.jsPerRoute, `budget ${kb(BUDGET.jsPerRoute)}`],
      [
        `largest image ${kb(largestImage)}`,
        largestImage <= BUDGET.largestImage,
        `budget ${kb(BUDGET.largestImage)}`,
      ],
      [`fonts ${fontFiles}`, fontFiles <= BUDGET.fontFiles, `budget ${BUDGET.fontFiles}`],
    ];

    if (route === '/') {
      checks.push([
        `total ${kb(total)}`,
        total <= BUDGET.homepageTotal,
        `budget ${kb(BUDGET.homepageTotal)}`,
      ]);
    }

    for (const [description, ok, budget] of checks) {
      if (ok) pass(`${label} — ${description}`);
      else fail(`${label} — ${description}, over ${budget}`);
    }

    await page.close();
    await context.close();
  }
} finally {
  await browser.close();
  stop();
}

if (process.exitCode !== 1) console.log('\nWithin budget.\n');
