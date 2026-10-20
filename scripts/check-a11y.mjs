#!/usr/bin/env node
/**
 * axe-core across every route, desktop and mobile. Zero WCAG 2.1 AA
 * violations is the gate.
 *
 * The one non-obvious detail — and it is the reason this script exists rather
 * than a one-liner in the docs — is `reducedMotion: 'reduce'`. Without it, axe
 * samples elements mid-animation and reports contrast failures that don't
 * exist. Chasing those wastes an afternoon and can end with a perfectly good
 * palette being "fixed".
 *
 * Requires `npm run build` first.
 */
import { AxeBuilder } from '@axe-core/playwright';
import { visit, launchBrowser, findRoutes, startServer, BASE_URL, VIEWPORTS, reportHeader, fail, pass } from './lib.mjs';

const { routes, dynamic } = await findRoutes();

reportHeader(`Accessibility — ${routes.length} route(s) × ${VIEWPORTS.length} viewport(s)`);

if (dynamic.length > 0) {
  console.log(
    `Note: dynamic segments not enumerated automatically: ${dynamic.join(', ')}\n` +
      'Add representative URLs to VERIFY_EXTRA_ROUTES (comma-separated) so they are covered.',
  );
}

const extra = (process.env.VERIFY_EXTRA_ROUTES ?? '')
  .split(',')
  .map((r) => r.trim())
  .filter(Boolean);

const allRoutes = [...routes, ...extra];

// Launch the browser BEFORE starting the server. If the launch throws — a
// missing Playwright binary is the usual cause — a server started first is
// left running with nothing to stop it, and the next run aborts on a busy port.
const browser = await launchBrowser();
const stop = await startServer();

let violationCount = 0;

try {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      // Not optional. See the note at the top of this file.
      reducedMotion: 'reduce',
    });

    for (const route of allRoutes) {
      const page = await context.newPage();
      await visit(page, new URL(route, BASE_URL).toString());

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      if (results.violations.length === 0) {
        pass(`${viewport.name} ${route}`);
      } else {
        violationCount += results.violations.length;
        fail(`${viewport.name} ${route} — ${results.violations.length} violation(s)`);
        for (const violation of results.violations) {
          console.error(`    ${violation.id} (${violation.impact}): ${violation.help}`);
          for (const node of violation.nodes.slice(0, 3)) {
            console.error(`      ${node.target.join(' ')}`);
          }
        }
      }

      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
  stop();
}

if (violationCount > 0) {
  console.error(`\n${violationCount} violation(s). This gate is zero, not "only minor ones".\n`);
  process.exit(1);
}

console.log(
  '\nNo violations.\n\n' +
    'axe cannot check these — do them by hand before calling the build done:\n' +
    '  · tab through every page: can the keyboard reach and operate everything?\n' +
    '  · does focus order follow the visual order?\n' +
    '  · does link text mean anything out of context?\n' +
    '  · do headings describe the structure rather than the type size?\n',
);
