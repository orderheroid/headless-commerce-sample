// =============================================================================
// Store settings. Change things here first before editing components.
// Colors are in app/globals.css (@theme → --color-brand-*), fonts in app/layout.tsx.
// =============================================================================

export const site = {
  /** Used when GET /meta has no `store_name` yet (set the business profile in the OrderHero dashboard). */
  fallbackName: 'Digital Store',
  /** Number and date format. */
  locale: 'id-ID',
  timeZone: 'Asia/Jakarta',

  home: {
    /** Small text above the title; `{store}` is replaced with the store name. */
    eyebrow: '{store} digital store',
    /** Two-part title: the second part is set in italics with a highlighter stroke. */
    title: 'Digital products,',
    titleAccent: 'delivered instantly.',
    subtitle: 'Pick a product, pay the way you like, and get it delivered automatically to your email and WhatsApp.',
    primaryCta: 'Browse products',
    secondaryCta: 'How to buy',
    featuredTitle: 'Featured picks',
    featuredCount: 6,
    catalogTitle: 'All products',
    searchPlaceholder: 'Search products…',
    /** Products shown per scroll step in the catalog. */
    pageSize: 12,
    howToBuyTitle: 'How to buy',
    howToBuy: [
      { title: 'Pick a product', text: 'Add products to your cart, then go to checkout.' },
      { title: 'Pay', text: 'Scan QRIS, transfer to a virtual account, or pay at a retail outlet.' },
      { title: 'Get your product', text: 'Your product is sent automatically to your email and WhatsApp once paid.' },
    ],
  },

  /** Trust points shown on the product page and at checkout. */
  assurances: [
    { icon: 'bolt', text: 'Delivered automatically once paid' },
    { icon: 'mail', text: 'To your email and WhatsApp' },
    { icon: 'shield', text: 'Secure payment through OrderHero' },
  ],

  footer: 'Digital products are delivered to your email and WhatsApp once payment is complete.',
  /** Fonts: see app/layout.tsx. Colors: see app/globals.css. */
} as const

export const checkoutConfig = {
  /** Delay before the total is recalculated after the cart/coupon/method changes (±400 ms recommended). */
  quoteDebounceMs: 400,
  /**
   * Cart contains stock-tracked products: an unpaid order closes after this many minutes
   * (`expires_in_minutes`, 15–1,440) so stock is not held by fake orders. Other products: 24 hours.
   */
  stockHoldMinutes: 60,
} as const

export const orderStatusConfig = {
  /** Size limit for manual transfer proof. Below Vercel's body limit (4.5 MB); the API accepts up to 5 MB. */
  proofMaxBytes: 4 * 1024 * 1024,
  proofTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  /** Status page polling interval (5–10 seconds recommended). */
  pollMs: 10_000,
  /** After this, polling stops and is replaced by a "Check status" button. */
  maxPollMs: 30 * 60_000,
  /** After the order deadline, keep checking briefly for last-minute payments. */
  graceAfterCloseMs: 10 * 60_000,
  /** Paid but not yet delivered for longer than this (when the API does not send `delivery.status` yet). */
  deliverySlowMs: 5 * 60_000,
} as const

export type AssuranceIcon = (typeof site.assurances)[number]['icon']
