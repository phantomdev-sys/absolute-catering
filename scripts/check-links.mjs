#!/usr/bin/env node
/**
 * Crawl the built site and report broken links.
 *
 * Internal 404s and dead in-page anchors are gates. External failures are
 * warnings only — other people's sites go down, and failing your own build
 * because a partner's server had a bad afternoon trains everyone to ignore the
 * check.
 *
 * mailto: and tel: links are validated by shape, which catches the typo that
 * quietly sends every enquiry into the void.
 */
import { visit, launchBrowser, findRoutes, startServer, BASE_URL, reportHeader, fail, pass } from './lib.mjs';

const { routes } = await findRoutes();
// Launch the browser BEFORE starting the server. If the launch throws — a
// missing Playwright binary is the usual cause — a server started first is
// left running with nothing to stop it, and the next run aborts on a busy port.
const browser = await launchBrowser();
const stop = await startServer();

reportHeader('Links');

const internalTargets = new Map(); // href -> Set(found on)
const externalTargets = new Map();
const anchorTargets = new Map();
const idsByRoute = new Map();

try {
  const context = await browser.newContext();

  for (const route of routes) {
    const page = await context.newPage();
    const url = new URL(route, BASE_URL).toString();
    await visit(page, url);

    const { hrefs, ids } = await page.evaluate(() => ({
      hrefs: Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')),
      ids: Array.from(document.querySelectorAll('[id]')).map((el) => el.id),
    }));

    idsByRoute.set(route, new Set(ids));

    for (const href of hrefs) {
      if (!href) continue;
      const record = (map) => {
        if (!map.has(href)) map.set(href, new Set());
        map.get(href).add(route);
      };

      if (href.startsWith('#')) record(anchorTargets);
      else if (/^https?:/i.test(href)) record(externalTargets);
      else if (/^(mailto|tel):/i.test(href)) record(externalTargets);
      else if (href.startsWith('/')) record(internalTargets);
    }

    await page.close();
  }

  await context.close();

  // --- internal -----------------------------------------------------------
  for (const [href, sources] of internalTargets) {
    const target = new URL(href, BASE_URL);
    const res = await fetch(target, { redirect: 'follow' });
    if (res.ok) pass(`${href}`);
    else fail(`${href} → ${res.status} (linked from ${[...sources].join(', ')})`);
  }

  // --- in-page anchors ----------------------------------------------------
  for (const [href, sources] of anchorTargets) {
    const id = href.slice(1);
    if (id === '') continue;
    const missing = [...sources].filter((route) => !idsByRoute.get(route)?.has(id));
    if (missing.length === 0) pass(`${href}`);
    else fail(`${href} — no element with that id on ${missing.join(', ')}`);
  }

  // --- external and protocol links ---------------------------------------
  for (const [href, sources] of externalTargets) {
    if (/^mailto:/i.test(href)) {
      const address = href.slice(7).split('?')[0];
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) pass(href);
      else fail(`${href} — not a valid email address (from ${[...sources].join(', ')})`);
      continue;
    }

    if (/^tel:/i.test(href)) {
      const number = href.slice(4);
      if (/^\+?[\d\s()-]{7,}$/.test(number)) pass(href);
      else fail(`${href} — doesn't look like a phone number (from ${[...sources].join(', ')})`);
      continue;
    }

    try {
      const res = await fetch(href, { method: 'HEAD', redirect: 'follow' });
      if (res.ok || res.status === 405) pass(href);
      else console.warn(`⚠ ${href} → ${res.status} (external, warning only)`);
    } catch {
      console.warn(`⚠ ${href} — unreachable (external, warning only)`);
    }
  }
} finally {
  await browser.close();
  stop();
}

if (process.exitCode === 1) {
  console.error('\nBroken internal links or anchors. Fix before handoff.\n');
} else {
  console.log('\nNo broken internal links.\n');
}
