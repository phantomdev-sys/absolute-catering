/**
 * Homepage copy. Facts only: what the shop sells (from the catalogue), where
 * it is, the 30-mile radius, the refrigerated van and the authorise-then-capture
 * payment model (both from the brief). No opening hours, slot times, charges
 * or minimum order until the client confirms them (register #7–9).
 */
export const home = {
  hero: {
    eyebrow: 'Cash & carry · Open to the public',
    heading: 'Your local cash & carry, delivered within 30 miles of Omagh',
    body: 'Fresh and frozen food, catering packaging and household essentials. We’ll bring your order out in our refrigerated van, or have it packed and ready to collect from the store.',
    formLabel: 'Check if we deliver to you',
    formNote: 'Outside the area? You can still order online and collect from us at Gortrush.',
  },
  area: {
    eyebrow: 'Where we deliver',
    heading: 'Our van covers 30 miles around Omagh',
    body: 'From Strabane to Enniskillen, Cookstown to Derry~Londonderry. Check your postcode to see if you’re in, or order online and collect from the store.',
    link: 'Check your postcode',
  },
  aisles: {
    heading: 'Shop by aisle',
    link: 'See every aisle',
  },
  ownBrand: {
    eyebrow: 'Our own label',
    heading: 'The Absolute Range',
    body: 'Sausages, bacon, burgers, kebabs and more, packed under our own Absolute Catering label.',
    link: (n: number) => `All ${n} Absolute Range products`,
  },
  how: {
    heading: 'How ordering works',
    steps: [
      {
        title: 'Check your postcode',
        body: 'Within 30 miles of the store, we’ll deliver. Further out, choose click & collect.',
      },
      {
        title: 'Fill your basket and book a slot',
        body: 'Pick a delivery slot, or a time to collect from the store at Gortrush.',
      },
      {
        title: 'We pick, pack and deliver',
        body: 'Your order is picked by hand, kept cold, and delivered or ready for collection at your chosen time.',
      },
    ],
    paymentNote:
      'You’re only charged for what we pick. If something’s out of stock, it’s simply left off your bill.',
  },
  visit: {
    heading: 'Prefer to shop in person?',
    body: 'We’re a cash and carry that’s open to everyone, from cafés and takeaways to families stocking the freezer.',
    vanAlt: 'The Absolute Catering Supplies delivery van, marked “Open to the public”',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=23D+Gortrush+Industrial+Estate+Omagh+BT78+5EJ',
    mapsLabel: 'Get directions',
  },
};
