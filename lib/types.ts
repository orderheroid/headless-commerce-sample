// Types follow the OrderHero v1 OpenAPI (https://api.orderhero.id/v1/openapi.json).
// Only the fields this store uses are written out.

export type Variant = {
  id: string | null
  name: string
  price: number | null
  compare_price: number | null
  is_active: boolean
  image_url: string | null
}

export type ProductImage = {
  url: string
  alt: string | null
  is_primary?: boolean
  sort_order?: number
}

export type Product = {
  id: string
  name: string
  slug: string | null
  description: string | null
  short_description: string | null
  price: number
  compare_price: number | null
  currency: string
  is_digital: boolean
  is_featured: boolean
  shipping_required: boolean
  track_inventory: boolean
  stock_quantity: number | null
  category: { id: string; name: string } | null
  images: ProductImage[]
  variants: Variant[]
  meta_title: string | null
  meta_description: string | null
  /** Not null = the buyer sets the price; not possible through the API, send them to `checkout_url`. */
  pay_what_you_want?: { min_price: number; suggested_price: number | null } | null
  checkout_url: string | null
}

export type Pagination = { page: number; limit: number; total: number; total_pages: number }

export type PaymentMethod = {
  code: string
  label: string
  category: string
  image: string | null
  fee_label: string | null
  min_amount: number | null
  expiry_minutes: number | null
  is_default: boolean
  /** Manual transfer methods only (category MANUAL_TRANSFER). */
  bank_name?: string
  account_number?: string
  account_holder_name?: string
}

export type PaymentMethods = {
  fee_payer: 'customer' | 'merchant'
  default_method: string | null
  methods: PaymentMethod[]
}

export type Quote = {
  currency: string
  items: {
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
    subtotal: number
    is_digital: boolean
    is_bump: boolean
  }[]
  subtotal: number
  bump: number
  discount: number
  shipping: number
  tax: number
  transaction_fee: number
  fee_payer: string
  total: number
  coupon: { code: string; discount: number } | null
  requires_shipping: boolean
  has_digital_items: boolean
}

export type OrderItem = {
  product_name: string
  variant_name: string | null
  quantity: number
  price: number
  subtotal: number
}

export type Order = {
  id: string
  order_number: string | null
  external_reference: string | null
  status: string
  payment_status: string
  payment_method: string | null
  items: OrderItem[]
  /** `total` already includes `unique_code` (the manual transfer unique code). */
  amounts: { currency: string; total: number; unique_code?: number }
  digital_delivered?: boolean
  digital_delivered_at?: string | null
  delivery?: { status: DeliveryStatus } | null
  paid_at?: string | null
  created_at?: string | null
  /** Order deadline (created_at + 24 hours); `null` for free orders and legacy orders. */
  expires_at?: string | null
  // `customer` is deliberately left untyped: buyer data is never used or passed on.
}

/**
 * `processing` = paid, usually done within seconds; `delayed` = paid but not yet delivered
 * after 15 minutes (retried automatically; the store may need to step in).
 */
export type DeliveryStatus = 'not_applicable' | 'pending' | 'processing' | 'delayed' | 'delivered'

export type Payment = {
  status: string
  method_code: string | null
  amount: number
  payment_url: string | null
  virtual_account: string | null
  qris_payload: string | null
  expires_at: string | null
}

/** The buyer's "I've made the transfer" confirmation; verified by the merchant in the dashboard. */
export type TransferConfirmation = {
  status: 'pending' | 'verified' | 'rejected'
  rejection_reason: string | null
}

export type OrderResult = {
  order: Order
  payment: Payment | null
  transfer_confirmation?: TransferConfirmation | null
  payment_page_url: string | null
  payment_error?: { error: string; message: string } | null
}

// ---- Shapes the browser sends to this project's own server ----

export type CartLine = {
  product_id: string
  variant_id?: string
  quantity: number
}

export type Failure = {
  ok: false
  code: string
  message: string
  /** seconds, from the Retry-After header */
  retryAfter?: number
}

export type QuoteResult = { ok: true; quote: Quote } | Failure

export type CreateOrderResult =
  | { ok: true; reference: string }
  | (Failure & { rotateIdempotencyKey?: boolean })

/** Payment code that may reach the browser. Contains no buyer data. */
export type PublicPayment = {
  method_code: string | null
  status: string
  amount: number
  /** QRIS: rendered as a QR in the browser */
  qris_payload: string | null
  /** VA: virtual account number; retail: retail outlet payment code */
  virtual_account: string | null
  /** Only when there is neither a QR nor a code (e.g. e-wallet): link to the provider's page */
  payment_url: string | null
  expires_at: string | null
}

/** The only order data that may reach the browser. */
export type PublicOrderStatus = {
  order_number: string | null
  status: string
  payment_status: string
  payment_method: string | null
  items: { name: string; variant: string | null; quantity: number; subtotal: number }[]
  total: number
  payment: PublicPayment | null
  /** OrderHero payment page, fallback when the payment code cannot be shown in this store */
  payment_page_url: string | null
  /** When OrderHero closes the unpaid order (ISO). */
  closes_at: string | null
  paid_at: string | null
  /** Digital product has been sent to the buyer's email/WA */
  digital_delivered: boolean
  /** From `order.delivery.status`; null if the API does not send it yet */
  delivery_status: DeliveryStatus | null
  /** Manual transfer unique code already included in `total` (0 if none). */
  unique_code: number
  /** Manual transfer confirmation status; without the sender name or proof (that is buyer data). */
  transfer: { status: TransferConfirmation['status']; rejection_reason: string | null } | null
}

export type ChangePaymentResult = { ok: true; order: PublicOrderStatus } | Failure
export type ConfirmTransferResult = ChangePaymentResult
