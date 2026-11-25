import { describe, expect, it } from 'vitest'

import { canCreateNewCode, closesAt, isClosed, isPaid, isPastClosing, isPaymentExpired, payBefore } from '@/lib/order-status'

const T = Date.parse('2026-11-25T00:00:00.000Z')
const iso = (ms: number) => new Date(ms).toISOString()
const HOUR = 3_600_000

describe('order status', () => {
  it('paid only from payment_status', () => {
    expect(isPaid({ payment_status: 'paid' })).toBe(true)
    expect(isPaid({ payment_status: 'pending' })).toBe(false)
  })
  it('closed from status or payment_status, including the legacy spelling', () => {
    expect(isClosed({ status: 'cancelled', payment_status: 'expired' })).toBe(true)
    expect(isClosed({ status: 'canceled', payment_status: 'pending' })).toBe(true)
    expect(isClosed({ status: 'pending', payment_status: 'pending' })).toBe(false)
  })
  it('a paid order is never treated as closed', () => {
    expect(isClosed({ status: 'refunded', payment_status: 'paid' })).toBe(false)
  })
})

describe('order deadline', () => {
  it('uses expires_at if present, otherwise created_at + 24 hours', () => {
    expect(closesAt({ expires_at: iso(T + HOUR), created_at: iso(T) })).toBe(iso(T + HOUR))
    expect(closesAt({ expires_at: null, created_at: iso(T) })).toBe(iso(T + 24 * HOUR))
    expect(closesAt({})).toBeNull()
  })
  it('past the deadline and the cutoff for creating a new code (last 5 minutes)', () => {
    const order = { closes_at: iso(T + HOUR) }
    expect(isPastClosing(order, T)).toBe(false)
    expect(isPastClosing(order, T + HOUR)).toBe(true)
    expect(canCreateNewCode(order, T)).toBe(true)
    expect(canCreateNewCode(order, T + HOUR - 4 * 60_000)).toBe(false)
    expect(canCreateNewCode({ closes_at: null }, T)).toBe(true)
  })
})

describe('payment code', () => {
  it('expired from status or from an expires_at that has passed', () => {
    expect(isPaymentExpired({ status: 'expired', expires_at: null }, T)).toBe(true)
    expect(isPaymentExpired({ status: 'pending', expires_at: iso(T - 1) }, T)).toBe(true)
    expect(isPaymentExpired({ status: 'pending', expires_at: iso(T + 1) }, T)).toBe(false)
  })
  it('payment deadline = whichever is earlier, the code or the order', () => {
    expect(payBefore({ expires_at: iso(T + HOUR) }, { closes_at: iso(T + 2 * HOUR) })).toBe(T + HOUR)
    expect(payBefore({ expires_at: iso(T + 3 * HOUR) }, { closes_at: iso(T + 2 * HOUR) })).toBe(T + 2 * HOUR)
    expect(payBefore(null, { closes_at: null })).toBeNull()
  })
})
