/**
 * Stock imagery for mood and category slots (licences in docs/STOCK-LICENCES.md).
 * Never used on product tiles or product pages, where it would imply that's
 * the product being sold.
 */
export type Banner = { src: string; alt: string; width: number; height: number };

export const heroImage: Banner = {
  src: '/images/stock/hero-full-english.webp',
  alt: 'A full English breakfast with bacon, sausages, eggs, beans and tomatoes in a cast-iron pan',
  width: 2000,
  height: 1117,
};

export const aisleBanners: Record<string, Banner> = {
  fresh: {
    src: '/images/stock/fresh-full-english.webp',
    alt: 'Bacon, sausage, fried egg and beans on a plate',
    width: 1600,
    height: 1066,
  },
};

export const ownBrandBanner: Banner = {
  src: '/images/stock/sausage-rolls-board.webp',
  alt: 'Golden sausage rolls on a wooden board',
  width: 1600,
  height: 1068,
};
