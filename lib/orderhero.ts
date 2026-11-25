import 'server-only'

import { buyerMessage } from './errors'
import type { CartLine, Failure, OrderResult, PaymentMethods, Pagination, Product, Quote } from './types'

// The only file that talks to OrderHero. The secret key is read only here,
// on the server; nothing imports this file from browser code ('server-only' enforces it).

const DEFAULT_BASE_URL = 'https://api.orderhero.id/v1'

/** Base URL from env ORDERHERO_API_URL (server only). Must be https, because the secret key is sent with it. */
function baseUrl(): string {
  const raw = process.env.ORDERHERO_API_URL?.trim()
  if (!raw) return DEFAULT_BASE_URL
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new OrderHeroError(500, 'CONFIG_MISSING', 'ORDERHERO_API_URL is not a valid URL')
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new OrderHeroError(500, 'CONFIG_MISSING', 'ORDERHERO_API_URL must be https and without credentials')
  }
  return url.toString().replace(/\/+$/, '')
}

export class OrderHeroError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** seconds, from the Retry-After header */
    readonly retryAfter?: number,
    /** extra fields in the error body, e.g. `available`, `available_codes`, `order_id` */
    readonly extra: Record<string, unknown> = {},
  ) {
    super(message)
    this.name = 'OrderHeroError'
  }
}

/** Turn any error into a shape that is safe to send to the browser, with a message for the buyer. */
export function toFailure(err: unknown): Failure {
  if (err instanceof OrderHeroError) {
    return {
      ok: false,
      code: err.code,
      message: buyerMessage(err.code, err.extra),
      ...(err.retryAfter ? { retryAfter: err.retryAfter } : {}),
    }
  }
  console.error('[orderhero] unexpected error', err)
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
  /** seconds; without this the response is not cached */
  revalidate?: number
  tags?: string[]
  timeoutMs?: number
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, idempotencyKey, revalidate, tags, timeoutMs = 15_000 } = options
  const key = process.env.ORDERHERO_SECRET_KEY

  if (!key) {
    throw new OrderHeroError(500, 'CONFIG_MISSING', 'ORDERHERO_SECRET_KEY is not set')
  }
  const url = baseUrl() + path // checked outside the try: a misconfiguration is not a network error
  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
        // FormData: Content-Type (with boundary) is set automatically by fetch.
        ...(body !== undefined && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
      // Next.js 16: fetch caching is opt-in. Only safe reads are cached; quotes and orders are always fresh.
      ...(revalidate && method === 'GET'
        ? { cache: 'force-cache' as const, next: { revalidate, ...(tags ? { tags } : {}) } }
        : { cache: 'no-store' as const }),
    })
  } catch {
    throw new OrderHeroError(0, 'NETWORK_ERROR', `Failed to reach OrderHero (${method} ${path})`)
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

// ---------------------------------------------------------------- meta & catalog

export async function getStoreName(): Promise<string | null> {
  const data = await request<{ workspace?: { store_name?: string | null } }>('/meta', { revalidate: 3600 })
  return data.workspace?.store_name ?? null
}

/** All active digital products. Cached for 300 seconds. */
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

/** Accepts `id` or `slug`. Returns null if the product does not exist or is inactive. */
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
  /** Secret key: buyer IP, only for the per-buyer limit (60 quotes/minute per IP). */
  tracking?: { client_ip?: string }
}

/** The total always comes from here. The body never contains price fields. */
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
  /** This store's status page; every payment link in OrderHero's WA/email points here. */
  status_url: string
  /** Buyer IP and user agent (secret key: connections to the API always come from the store server). */
  tracking?: { client_ip?: string; client_user_agent?: string }
  /** How long an unpaid order stays open (15–1,440, default 1,440). Shorter = stock is released sooner. */
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

/** Order cache tag; cleared (updateTag) after the payment code is regenerated so the old code is not shown. */
export function orderCacheTag(ref: string): string {
  return `order:${ref}`
}

/** `ref` = external_reference. `revalidate` (seconds) is used by status polling to save read quota. */
export async function getOrder(ref: string, options: { revalidate?: number } = {}): Promise<OrderResult> {
  return request<OrderResult>(`/orders/${encodeURIComponent(ref)}`, {
    revalidate: options.revalidate,
    tags: [orderCacheTag(ref)],
  })
}

/**
 * Create a new payment code (the old code expired, or the buyer changed method).
 * Changing method = the server recalculates the total; show `order.amounts.total` from this response.
 *
 * One `idempotencyKey` per attempt (one click): a retry with the same key and body returns the
 * first response, not a second code. `reuseExisting` is only a fallback when the attempt's outcome is unknown.
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
 * "I've made the transfer" for manual transfer orders. The proof (optional) is forwarded straight to OrderHero
 * as multipart; this store does not store any files. The merchant verifies it in the dashboard
 * (the payment confirmations page under Finance), then the order becomes paid.
 */
export async function confirmTransfer(ref: string, input: { senderName: string; proofFile?: File | null }): Promise<void> {
  const form = new FormData()
  form.append('sender_name', input.senderName)
  if (input.proofFile) form.append('proof_file', input.proofFile, input.proofFile.name)
  await request<unknown>(`/orders/${encodeURIComponent(ref)}/confirm-transfer`, { method: 'POST', body: form, timeoutMs: 30_000 })
}
