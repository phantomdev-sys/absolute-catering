#!/usr/bin/env node
/**
 * Full-page screenshots of every route, desktop and mobile.
 *
 * This gate exists because on a real build every automated check passed on a
 * page whose content was invisible: the markup was there, axe was happy, the
 * build was clean, and the page rendered blank. Only looking caught it.
 *
 * So the script's job is to produce the images. The gate is a human opening
 * them — and showing them to the client. A script cannot pass this one on your
 * behalf.
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { visit, launchBrowser, findRoutes, startServer, BASE_URL, VIEWPORTS, VERIFY_DIR, reportHeader, pass } from './lib.mjs';

const outDir = path.join(VERIFY_DIR, 'screens');
await mkdir(outDir, { recursive: true });

const { routes } = await findRoutes();
const extra = (process.env.VERIFY_EXTRA_ROUTES ?? '')
  .split(',')
  .map((r) => r.trim())
  .filter(Boolean);
const allRoutes = [...routes, ...extra];

reportHeader(`Screenshots — ${allRoutes.length} route(s) × ${VIEWPORTS.length} viewport(s)`);

// Launch the browser BEFORE starting the server. If the launch throws — a
// missing Playwright binary is the usual cause — a server started first is
// left running with nothing to stop it, and the next run aborts on a busy port.
const browser = await launchBrowser();
const stop = await startServer();

try {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
    });

    for (const route of allRoutes) {
      const page = await context.newPage();
      await visit(page, new URL(route, BASE_URL).toString());

      // Let scroll-driven reveals settle at their end state before capturing,
      // otherwise the screenshot shows content mid-fade and looks like a bug.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);

      const name = `${viewport.name}${route === '/' ? '-home' : route.replace(/\//g, '-')}.png`;
      await page.screenshot({ path: path.join(outDir, name), fullPage: true });
      pass(name);
      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
  stop();
}

console.log(
  `\nWritten to .verify/screens/\n\n` +
    'Now open them. Check: content actually visible, no overlapping text, nothing\n' +
    'running off the right edge, images loaded rather than showing alt text, and\n' +
    'the mobile view not simply being the desktop view scaled down.\n' +
    'Then show them to the client.\n',
);
