import type { NextConfig } from 'next';
import { legacyRedirects } from './lib/redirects';
import packshots from './content/packshots-version.json';

const nextConfig: NextConfig = {
  // Fail the build on type errors rather than shipping them. The verification
  // gates are worthless if the build quietly tolerates breakage.
  //
  // Next 16 no longer runs ESLint during `next build`, so linting is a
  // separate gate: `npm run lint`, and `npm run verify` runs both.
  typescript: { ignoreBuildErrors: false },

  images: {
    // Add the Supabase storage host here once a project uses it, e.g.
    // { protocol: 'https', hostname: '<ref>.supabase.co', pathname: '/storage/v1/object/public/**' }
    remotePatterns: [],
    // Packshot URLs carry ?v=<content hash> (scripts/sync-packshots.mjs) so a
    // replaced photo is never served from the optimiser's cache. Next 16 only
    // optimises local images whose query string is listed here; everything
    // else local stays allowed without a query.
    localPatterns: [
      { pathname: '/images/packshots/**', search: `?v=${packshots.version}` },
      { pathname: '/**', search: '' },
    ],
  },

  async redirects() {
    // 301s from the WooCommerce site. The mapping and its reasoning live in
    // lib/redirects.ts; data/redirects/redirects.csv is the readable export.
    return legacyRedirects();
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Tighten per project once the third-party surface is known.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
