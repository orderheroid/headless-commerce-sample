'use server'

import { checkoutConfig } from '@/config/site'
import { buyerTracking } from '@/lib/client-info'
import { buyerMessage } from '@/lib/errors'
import { isUuid } from '@/lib/format'
import { OrderHeroError, createOrder, getOrder, getProduct, getQuote, toFailure } from '@/lib/orderhero'
import { siteOrigin } from '@/lib/site-url'
import type { CartLine, CreateOrderResult, Failure, OrderResult, QuoteResult } from '@/lib/types'
import { cleanBuyer, validateBuyer } from '@/lib/validation'

// Server actions are called from the browser, so all input is re-validated here.
// No price field is accepted or sent to the API.

const fail = (code: string, message = buyerMessage(code)): Failure => ({ ok: false, code, message })

// ---------------------------------------------------------------- input sanitizers

function cleanItems(input: unknown): CartLine[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 50) return null
  const items: CartLine[] = []
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') return null
    const { product_id, variant_id, quantity } = raw as Record<string, unknown>
    if (typeof product_id !== 'string' || product_id.length === 0 || product_id.length > 200) return null
    if (variant_id !== undefined && (typeof variant_id !== 'string' || variant_id.length > 200)) return null
    if (!Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > 100) return null
    items.push({ product_id, quantity: quantity as number, ...(variant_id ? { variant_id } : {}) })
  }
  return items
}

function cleanCode(value: unknown, max = 64): string | undefined {
  if (typeof value !== 'string') return undefined
  const v = value.trim()
  return v && v.length <= max ? v : undefined
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')

// ---------------------------------------------------------------- quote

export async function quoteAction(input: { items: unknown; paymentMethod?: unknown; couponCode?: unknown }): Promise<QuoteResult> {
  const items = cleanItems(input?.items)
  if (!items) return fail('ITEMS_REQUIRED')
  try {
    const { client_ip } = await buyerTracking()
    const quote = await getQuote({
      items,
      payment_method: cleanCode(input.paymentMethod),
      coupon_code: cleanCode(input.couponCode),
      // Limit of 60 quotes/minute per buyer IP, so one visitor cannot use up the store's quote quota.
      ...(client_ip ? { tracking: { client_ip } } : {}),
    })
    return { ok: true, quote }
  } catch (err) {
    return toFailure(err)
  }
}

// ---------------------------------------------------------------- order

/** True if any product in the cart has tracked stock (stock is reserved when the order is created). */
async function holdsStock(items: CartLine[]): Promise<boolean> {
  const products = await Promise.all(items.map((i) => getProduct(i.product_id).catch(() => null)))
  return products.some((p) => p?.track_inventory === true)
}

/** 429 message for order creation: there are limits per email/phone and per buyer IP. */
function orderRateLimited(err: OrderHeroError): Failure {
  const minutes = err.retryAfter ? Math.max(1, Math.ceil(err.retryAfter / 60)) : null
  return {
    ...fail('RATE_LIMITED', `Too many order attempts from this contact or network. Try again ${minutes ? `in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}` : 'in a moment'}.`),
    ...(err.retryAfter ? { retryAfter: err.retryAfter } : {}),
  }
}

/** The order that may already exist for this external_reference; null if there really is none yet. */
async function findExisting(reference: string): Promise<OrderResult | null> {
  try {
    return await getOrder(reference)
  } catch (err) {
    if (err instanceof OrderHeroError && err.status === 404) return null
    throw err
  }
}

export async function createOrderAction(input: {
  items: unknown
  name: unknown
  email: unknown
  phone: unknown
  paymentMethod: unknown
  couponCode?: unknown
  idempotencyKey: unknown
  externalReference: unknown
}): Promise<CreateOrderResult> {
  const items = cleanItems(input?.items)
  if (!items) return fail('ITEMS_REQUIRED')
  if (!isUuid(input.idempotencyKey) || !isUuid(input.externalReference)) return fail('INTERNAL_ERROR')
  const reference = input.externalReference

  const raw = { name: str(input.name), email: str(input.email), phone: str(input.phone) }
  const customer = cleanBuyer(raw)
  if (!customer) {
    const [, message] = Object.entries(validateBuyer(raw))[0] ?? []
    return fail('INVALID_CUSTOMER', message ?? 'Please check the buyer details again.')
  }
  const paymentMethod = cleanCode(input.paymentMethod)
  if (!paymentMethod) return fail('PAYMENT_METHOD_REQUIRED')

  let statusUrl: string
  let stockHold: boolean
  try {
    // Origin comes from env/Vercel, not from request headers (see lib/site-url.ts).
    statusUrl = `${await siteOrigin()}/pesanan/${reference}`
    stockHold = await holdsStock(items) // catalog is cached for 300 seconds
  } catch (err) {
    return toFailure(err) // misconfiguration: no order was created
  }

  try {
    await createOrder(
      {
        items,
        customer,
        payment_method: paymentMethod,
        ...(cleanCode(input.couponCode) ? { coupon_code: cleanCode(input.couponCode) } : {}),
        external_reference: reference,
        // Fallback if the buyer pays through the OrderHero page: return to the store's status page.
        return_url: statusUrl,
        // The payment link in the "order received" WA/email and in payment reminders points to the store's status page.
        status_url: statusUrl,
        // Buyer IP: the basis for OrderHero's per-IP limit for secret keys, and for ad pixel matching.
        tracking: await buyerTracking(),
        // Stock-tracked products: unpaid orders are closed sooner and their stock is released.
        // Products without stock: default of 24 hours, so VA/retail outlet buyers have enough time.
        ...(stockHold ? { expires_in_minutes: checkoutConfig.stockHoldMinutes } : {}),
      },
      input.idempotencyKey,
    )
    return { ok: true, reference }
  } catch (err) {
    if (!(err instanceof OrderHeroError)) return toFailure(err)

    // The order may already have been created: read the existing one via external_reference, do not create a new one.
    if (['DUPLICATE_REFERENCE', 'IDEMPOTENCY_OUTCOME_UNKNOWN', 'IDEMPOTENCY_KEY_REUSED'].includes(err.code)) {
      let existing: OrderResult | null
      try {
        existing = await findExisting(reference)
      } catch (readErr) {
        return toFailure(readErr)
      }
      if (existing) return { ok: true, reference }

      if (err.code === 'DUPLICATE_REFERENCE') {
        // The reference is taken but its order cannot be read: do not retry with this reference.
        return fail(err.code, 'Your order is being processed. Reload this page in a moment.')
      }
      // No order with this reference exists yet. external_reference stays the same and is kept unique
      // by OrderHero, so changing only the Idempotency-Key cannot produce a second order.
      return { ...toFailure(err), rotateIdempotencyKey: true }
    }
    if (err.code === 'RATE_LIMITED') return orderRateLimited(err)
    return toFailure(err)
  }
}
