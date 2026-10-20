// Writes data/redirects/redirects.csv from lib/redirects.ts so the client-readable
// list never drifts from what the site actually does.
// Run: node --experimental-strip-types scripts/export-redirects.ts
import { writeFileSync } from 'node:fs';
import { legacyRedirects } from '../lib/redirects.ts';
const rows = legacyRedirects().map((r) => `${r.source},${r.destination},308`);
writeFileSync(new URL('../data/redirects/redirects.csv', import.meta.url), ['from,to,status', ...rows].join('\n') + '\n');
console.log(`${rows.length} redirects written`);
