import 'server-only'

import { buyerMessage } from './errors'
import type { CartLine, Failure, OrderResult, PaymentMethods, Pagination, Product, Quote } from './types'

// Satu-satunya berkas yang berbicara dengan OrderHero. Kunci secret hanya dibaca di sini,
// di server; tidak ada yang mengimpor berkas ini dari kode browser ('server-only' menjaganya).

const DEFAULT_BASE_URL = 'https://api.orderhero.id/v1'

/** Base URL dari env ORDERHERO_API_URL (server saja). Wajib https, karena kunci secret ikut terkirim. */
function baseUrl(): string {
  const raw = process.env.ORDERHERO_API_URL?.trim()
  if (!raw) return DEFAULT_BASE_URL
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new OrderHeroError(500, 'CONFIG_MISSING', 'ORDERHERO_API_URL bukan URL yang valid')
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new OrderHeroError(500, 'CONFIG_MISSING', 'ORDERHERO_API_URL harus https dan tanpa kredensial')
  }
  return url.toString().replace(/\/+$/, '')
}

export class OrderHeroError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** detik, dari header Retry-After */
    readonly retryAfter?: number,
    /** field tambahan di body error, mis. `available`, `available_codes`, `order_id` */
    readonly extra: Record<string, unknown> = {},
  ) {
    super(message)
    this.name = 'OrderHeroError'
  }
}

/** Ubah error apa pun menjadi bentuk yang aman dikirim ke browser, dengan pesan untuk pembeli. */
export function toFailure(err: unknown): Failure {
  if (err instanceof OrderHeroError) {
    return {
      ok: false,
      code: err.code,
      message: buyerMessage(err.code, err.extra),
      ...(err.retryAfter ? { retryAfter: err.retryAfter } : {}),
    }
  }
  console.error('[orderhero] error tak terduga', err)
  return { ok: false, code: 'INTERNAL_ERROR', message: buyerMessage('INTERNAL_ERROR') }
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(1, Math.ceil(seconds))
  const date = Date.parse(value)
  if (Number.isNaN(date)) return undefined
  return Math.max(1, Math.ceil((date - Date.now()) / 1000))
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  idempotencyKey?: string
  /** detik; tanpa ini respons tidak di-cache */
  revalidate?: number
  tags?: string[]
  timeoutMs?: number
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, idempotencyKey, revalidate, tags, timeoutMs = 15_000 } = options
  const key = process.env.ORDERHERO_SECRET_KEY

  if (!key) {
    throw new OrderHeroError(500, 'CONFIG_MISSING', 'ORDERHERO_SECRET_KEY belum diisi')
  }
  const url = baseUrl() + path // dicek di luar try: salah konfigurasi bukan error jaringan
  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
        // FormData: Content-Type (dengan boundary) diisi otomatis oleh fetch.
        ...(body !== undefined && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
      // Next.js 16: cache fetch bersifat opt-in. Hanya baca yang aman di-cache; quote dan order selalu segar.
      ...(revalidate && method === 'GET'
        ? { cache: 'force-cache' as const, next: { revalidate, ...(tags ? { tags } : {}) } }
        : { cache: 'no-store' as const }),
    })
  } catch {
    throw new OrderHeroError(0, 'NETWORK_ERROR', `Gagal menghubungi OrderHero (${method} ${path})`)
  }
  const status = res.status
  const retryAfter = parseRetryAfter(res.headers.get('retry-after'))
  const json: unknown = await res.json().catch(() => null)

  const envelope = (json && typeof json === 'object' ? json : {}) as Record<string, unknown>
  if (status >= 200 && status < 300 && envelope.ok === true) {
    return envelope.data as T
  }

  const { error, message, ...extra } = envelope
  delete extra.ok
  const code = typeof error === 'string' ? error : status === 429 ? 'RATE_LIMITED' : 'INTERNAL_ERROR'
  if (status === 401 || status === 403 || status >= 500) {
    console.error(`[orderhero] ${method} ${path} -> ${status} ${code}`)
  }
  throw new OrderHeroError(status, code, typeof message === 'string' ? message : code, retryAfter, extra)
}

// ---------------------------------------------------------------- meta & katalog

export async function getStoreName(): Promise<string | null> {
  const data = await request<{ workspace?: { store_name?: string | null } }>('/meta', { revalidate: 3600 })
  return data.workspace?.store_name ?? null
}

/** Semua produk digital yang aktif. Di-cache 300 detik. */
export async function listDigitalProducts(): Promise<Product[]> {
  const products: Product[] = []
  for (let page = 1; page <= 10; page++) {
    const data = await request<{ products: Product[]; pagination: Pagination }>(
      `/catalog/products?is_digital=true&sort=featured&limit=100&page=${page}`,
      { revalidate: 300 },
    )
    products.push(...data.products)
    if (page >= data.pagination.total_pages) break
  }
  return products
}

/** Menerima `id` atau `slug`. Mengembalikan null bila produk tidak ada atau non-aktif. */
export async function getProduct(idOrSlug: string): Promise<Product | null> {
  try {
    const data = await request<{ product: Product }>(`/catalog/products/${encodeURIComponent(idOrSlug)}`, {
      revalidate: 300,
    })
    return data.product
  } catch (err) {
    if (err instanceof OrderHeroError && err.status === 404) return null
    throw err
  }
}

// ---------------------------------------------------------------- checkout

export async function getPaymentMethods(): Promise<PaymentMethods> {
  return request<PaymentMethods>('/checkout/payment-methods', { revalidate: 60 })
}

export type QuoteInput = {
  items: CartLine[]
  payment_method?: string
  coupon_code?: string
  /** Kunci secret: IP pembeli, hanya untuk batas per pembeli (60 quote/menit per IP). */
  tracking?: { client_ip?: string }
}

/** Total selalu dari sini. Body tidak pernah memuat field harga. */
export async function getQuote(input: QuoteInput): Promise<Quote> {
  return request<Quote>('/checkout/quote', { method: 'POST', body: input })
}

// ---------------------------------------------------------------- order

export type CreateOrderInput = {
  items: CartLine[]
  customer: { name: string; email: string; phone: string }
  payment_method: string
  coupon_code?: string
  external_reference: string
  return_url: string
  /** Halaman status toko ini; semua tautan bayar di WA/email OrderHero mengarah ke sini. */
  status_url: string
  /** IP dan user agent pembeli (kunci secret: koneksi ke API selalu dari server toko). */
  tracking?: { client_ip?: string; client_user_agent?: string }
  /** Berapa lama order belum dibayar tetap terbuka (15–1.440, bawaan 1.440). Lebih pendek = stok cepat kembali. */
  expires_in_minutes?: number
}

export async function createOrder(input: CreateOrderInput, idempotencyKey: string): Promise<OrderResult> {
  return request<OrderResult>('/orders', {
    method: 'POST',
    body: { ...input, initiate_payment: true },
    idempotencyKey,
    timeoutMs: 30_000,
  })
}

/** Tag cache order; dibersihkan (updateTag) setelah kode bayar dibuat ulang supaya tidak tampil kode lama. */
export function orderCacheTag(ref: string): string {
  return `order:${ref}`
}

/** `ref` = external_reference. `revalidate` (detik) dipakai polling status supaya hemat kuota baca. */
export async function getOrder(ref: string, options: { revalidate?: number } = {}): Promise<OrderResult> {
  return request<OrderResult>(`/orders/${encodeURIComponent(ref)}`, {
    revalidate: options.revalidate,
    tags: [orderCacheTag(ref)],
  })
}

/**
 * Buat kode bayar baru (kode lama kedaluwarsa, atau pembeli ganti metode).
 * Ganti metode = total dihitung ulang server; tampilkan `order.amounts.total` dari respons ini.
 *
 * `idempotencyKey` satu per percobaan (satu klik): retry dengan kunci dan body yang sama mengembalikan
 * respons pertama, bukan kode kedua. `reuseExisting` hanya cadangan bila hasil percobaan tidak diketahui.
 */
export async function createPayment(
  ref: string,
  paymentMethod: string,
  options: { idempotencyKey: string; reuseExisting?: boolean },
): Promise<OrderResult> {
  return request<OrderResult>(`/orders/${encodeURIComponent(ref)}/payments`, {
    method: 'POST',
    body: { payment_method: paymentMethod, ...(options.reuseExisting ? { reuse_existing: true } : {}) },
    idempotencyKey: options.idempotencyKey,
    timeoutMs: 30_000,
  })
}

/**
 * "Saya sudah transfer" untuk order transfer manual. Bukti (opsional) diteruskan langsung ke OrderHero
 * sebagai multipart; toko ini tidak menyimpan berkas apa pun. Merchant memverifikasinya di dashboard
 * (Finance → Konfirmasi Pembayaran), lalu order menjadi lunas.
 */
export async function confirmTransfer(ref: string, input: { senderName: string; proofFile?: File | null }): Promise<void> {
  const form = new FormData()
  form.append('sender_name', input.senderName)
  if (input.proofFile) form.append('proof_file', input.proofFile, input.proofFile.name)
  await request<unknown>(`/orders/${encodeURIComponent(ref)}/confirm-transfer`, { method: 'POST', body: form, timeoutMs: 30_000 })
}
