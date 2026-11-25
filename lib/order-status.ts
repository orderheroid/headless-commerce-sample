// Order status rules (used by server and browser).
// The API passes status values through as is, including legacy values, so the list is deliberately loose.

/** `status` or `payment_status` with one of these values = order closed, polling stops. */
export const CLOSED_VALUES = ['cancelled', 'canceled', 'expired', 'failed', 'refunded', 'returned', 'deleted']

/** Fallback when the order has no `expires_at`: the order closes at `created_at` + 24 hours. */
export const ORDER_LIFETIME_MS = 24 * 60 * 60_000

/**
 * OrderHero caps a payment code's validity at the order deadline, and rejects a new code
 * when less than 5 minutes remain (`409 ORDER_CLOSED`). The store follows the same limit.
 */
export const NO_NEW_CODE_BEFORE_CLOSE_MS = 5 * 60_000

export function isPaid(o: { payment_status: string }): boolean {
  return o.payment_status === 'paid'
}

export function isClosed(o: { status: string; payment_status: string }): boolean {
  return !isPaid(o) && (CLOSED_VALUES.includes(o.status) || CLOSED_VALUES.includes(o.payment_status))
}

function time(iso: string | null | undefined): number | null {
  if (!iso) return null
  const t = Date.parse(iso)
  return Number.isFinite(t) ? t : null
}

/** Order closing time: the order's `expires_at` if present, otherwise `created_at` + 24 hours. */
export function closesAt(order: { expires_at?: string | null; created_at?: string | null }): string | null {
  const explicit = time(order.expires_at)
  if (explicit !== null) return new Date(explicit).toISOString()
  const created = time(order.created_at)
  return created === null ? null : new Date(created + ORDER_LIFETIME_MS).toISOString()
}

/** The order is past its closing time even if the cron has not written the `cancelled` status yet. */
export function isPastClosing(o: { closes_at: string | null }, now = Date.now()): boolean {
  const t = time(o.closes_at)
  return t !== null && t <= now
}

/** A new payment code may still be created (not yet in the last 5 minutes before the order closes). */
export function canCreateNewCode(o: { closes_at: string | null }, now = Date.now()): boolean {
  const t = time(o.closes_at)
  return t === null || now < t - NO_NEW_CODE_BEFORE_CLOSE_MS
}

/** `payment.status` stays `pending` until the cron runs, so expiry is computed here from `expires_at`. */
export function isPaymentExpired(p: { status: string; expires_at: string | null }, now = Date.now()): boolean {
  if (p.status === 'expired') return true
  const t = time(p.expires_at)
  return t !== null && t <= now
}

/** Payment deadline shown: whichever comes first, the code expiring or the order closing. */
export function payBefore(p: { expires_at: string | null } | null, o: { closes_at: string | null }): number | null {
  const a = time(p?.expires_at)
  const b = time(o.closes_at)
  if (a === null) return b
  if (b === null) return a
  return Math.min(a, b)
}
