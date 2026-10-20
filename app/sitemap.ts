import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

/**
 * Generated, not hand-written — a hand-maintained sitemap drifts within weeks,
 * and the link checker uses this to enumerate routes. Add dynamic routes by
 * mapping over the same data-access functions the pages use.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [...site.nav, ...site.footerNav].map((item) => item.href);
  const unique = Array.from(new Set(routes));

  return unique.map((href) => ({
    url: new URL(href, site.url).toString(),
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: href === '/' ? 1 : 0.7,
  }));
}
