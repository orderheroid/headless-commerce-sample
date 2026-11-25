// Tipe mengikuti OpenAPI OrderHero v1 (https://api.orderhero.id/v1/openapi.json).
// Hanya field yang dipakai toko ini yang ditulis.

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
  /** Tidak null = harga ditentukan pembeli; tidak bisa lewat API, arahkan ke `checkout_url`. */
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
  /** Hanya metode transfer manual (kategori MANUAL_TRANSFER). */
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
  /** `total` sudah termasuk `unique_code` (kode unik transfer manual). */
  amounts: { currency: string; total: number; unique_code?: number }
  digital_delivered?: boolean
  digital_delivered_at?: string | null
  delivery?: { status: DeliveryStatus } | null
  paid_at?: string | null
  created_at?: string | null
  /** Tenggat order (created_at + 24 jam); `null` untuk order gratis dan order lama. */
  expires_at?: string | null
  // `customer` sengaja tidak diberi tipe: data pembeli tidak pernah dipakai atau diteruskan.
}

/**
 * `processing` = lunas, biasanya selesai dalam hitungan detik; `delayed` = lunas tapi belum terkirim
 * setelah 15 menit (dicoba ulang otomatis; toko mungkin perlu turun tangan).
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

/** Konfirmasi "saya sudah transfer" dari pembeli; diverifikasi merchant di dashboard. */
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

// ---- Bentuk yang dikirim browser ke server milik project ini ----

export type CartLine = {
  product_id: string
  variant_id?: string
  quantity: number
}

export type Failure = {
  ok: false
  code: string
  message: string
  /** detik, dari header Retry-After */
  retryAfter?: number
}

export type QuoteResult = { ok: true; quote: Quote } | Failure

export type CreateOrderResult =
  | { ok: true; reference: string }
  | (Failure & { rotateIdempotencyKey?: boolean })

/** Kode bayar yang boleh sampai ke browser. Tidak memuat data pembeli. */
export type PublicPayment = {
  method_code: string | null
  status: string
  amount: number
  /** QRIS: dirender jadi QR di browser */
  qris_payload: string | null
  /** VA: nomor rekening virtual; retail: kode bayar gerai */
  virtual_account: string | null
  /** Hanya bila tidak ada QR maupun kode (mis. e-wallet): tautan ke halaman penyedia */
  payment_url: string | null
  expires_at: string | null
}

/** Satu-satunya data order yang boleh sampai ke browser. */
export type PublicOrderStatus = {
  order_number: string | null
  status: string
  payment_status: string
  payment_method: string | null
  items: { name: string; variant: string | null; quantity: number; subtotal: number }[]
  total: number
  payment: PublicPayment | null
  /** Halaman bayar OrderHero, cadangan bila kode bayar tidak bisa ditampilkan di toko ini */
  payment_page_url: string | null
  /** Kapan OrderHero menutup order yang belum dibayar (ISO). */
  closes_at: string | null
  paid_at: string | null
  /** Produk digital sudah dikirim ke email/WA pembeli */
  digital_delivered: boolean
  /** Dari `order.delivery.status`; null bila API belum mengirimnya */
  delivery_status: DeliveryStatus | null
  /** Kode unik transfer manual yang sudah termasuk di `total` (0 bila tidak ada). */
  unique_code: number
  /** Status konfirmasi transfer manual; tanpa nama pengirim maupun bukti (itu data pembeli). */
  transfer: { status: TransferConfirmation['status']; rejection_reason: string | null } | null
}

export type ChangePaymentResult = { ok: true; order: PublicOrderStatus } | Failure
export type ConfirmTransferResult = ChangePaymentResult
