/**
 * Copy for the delivery, payment and about pages.
 *
 * Payment copy mirrors the client explainer ("How payment works on your new
 * website", 20 Oct 2026). Delivery days, times, charges and minimum order are
 * not here because the client hasn't confirmed them (register #7–9); the page
 * says they're coming rather than inventing them.
 */
export const deliveryPage = {
  title: 'Delivery & collection',
  intro:
    'We deliver in our own refrigerated van to addresses within 30 miles of the store in Omagh. Anywhere further out, you can still order online and collect from us.',
  results: {
    delivers: (pc: string, miles: number) => ({
      heading: `Good news: we deliver to ${pc}`,
      body: `You’re about ${miles} miles from the store, inside our 30-mile delivery area.`,
    }),
    collect: (pc: string, miles: number) => ({
      heading: `${pc} is outside our delivery area`,
      body: `You’re about ${miles} miles from the store. You can still order online and collect from us at Gortrush.`,
    }),
    invalid: 'That doesn’t look like a UK postcode. Check it and try again, or give us a call.',
    notFound: (pc: string) => `We couldn’t find ${pc}. Check it and try again, or give us a call.`,
    unavailable:
      'We couldn’t check your postcode just now. Please try again in a moment, or give us a call and we’ll tell you.',
  },
  details: [
    {
      heading: 'Delivery',
      body: 'Your order is picked by hand and brought out in our refrigerated van, so chilled and frozen food stays cold all the way to your door.',
    },
    {
      heading: 'Click & collect',
      body: 'Choose a collection time and we’ll have your order packed and waiting at the store: 23D Gortrush Industrial Estate, Omagh, BT78 5EJ.',
    },
    {
      heading: 'Charges and minimum order',
      body: 'Delivery is £5, with a minimum spend of £50. Click & collect is free, with no minimum. Delivery days and collection times are being finalised and will be shown when you book.',
    },
  ],
  townsHeading: 'Towns in and around our delivery area',
};

export const paymentsPage = {
  title: 'How payment works',
  intro:
    'When you order, your card is checked and the order total is held, but no money is taken yet. Once we’ve picked your order, we charge only for what’s actually going out.',
  sections: [
    {
      heading: 'Step by step',
      steps: [
        'You check out and pay by card, Apple Pay or Google Pay. Your bank holds the order total.',
        'We pick your order by hand. If anything’s out of stock, we leave it out.',
        'We charge your card for the final total, and the rest of the hold is released automatically.',
        'We email you the final total, listing anything we couldn’t supply.',
        'If an order is cancelled before picking, the whole hold is released and nothing is charged.',
      ],
    },
  ],
  statement: {
    heading: 'What you’ll see on your bank statement',
    body: [
      'Straight after ordering, the full total usually shows as “pending” in your banking app. Once your order is picked and charged, it changes to the final amount.',
      'If something wasn’t available, the difference is released back to your balance. Most banks do this within a day or two; some take a few days.',
    ],
  },
  window: {
    heading: 'Why you can book up to 6 days ahead',
    body: 'Card holds expire after about a week, so we pick and charge every order while its hold is still valid.',
  },
  security: {
    heading: 'Your card details',
    body: 'Payments are handled by Stripe. Your card details never reach our systems or our staff.',
  },
};

export const aboutPage = {
  title: 'About us',
  intro:
    'Absolute Catering Supplies is a cash and carry on the Gortrush Industrial Estate in Omagh, and it’s open to the public.',
  body: [
    'Our shelves carry fresh and frozen food, our own Absolute Range, gluten-free lines, catering packaging and household essentials. Now you can order them online for delivery within 30 miles, or click & collect.',
  ],
  // Flagged for the client: their own story, in their words, replaces this.
  awaiting: 'More about us is coming soon.',
};
