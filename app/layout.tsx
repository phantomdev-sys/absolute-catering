import type { Metadata } from 'next';
import { site } from '@/content/site';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { BasketProvider } from '@/components/basket/basket-provider';
import { DemoBanner } from '@/components/site/demo-banner';
import { FavouritesProvider } from '@/components/favourites/favourites-provider';
import './globals.css';

/**
 * Note what is NOT here: `next/font/google`. Google Fonts is blocked in the
 * build container, so importing it fails the build outright rather than
 * degrading at runtime. Self-host Fontshare woff2 files in public/fonts/ and
 * declare @font-face in globals.css.
 *
 * If Adobe Fonts is used — Alex's own properties only, never a client site —
 * the integration is a plain stylesheet link in <head>:
 *   <link rel="stylesheet" href="https://use.typekit.net/KITID.css" />
 */

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: site.name,
    url: site.url,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="flex min-h-screen flex-col">
        {/* Skip link — the cheapest keyboard accessibility win there is, and
            the one most often missing. Visible only when focused. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
        >
          Skip to main content
        </a>

        <BasketProvider>
          <FavouritesProvider>
            <DemoBanner />
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </FavouritesProvider>
        </BasketProvider>
      </body>
    </html>
  );
}
