import { describe, expect, it } from 'vitest'

import { canCreateNewCode, closesAt, isClosed, isPaid, isPastClosing, isPaymentExpired, payBefore } from '@/lib/order-status'

const T = Date.parse('2026-11-25T00:00:00.000Z')
const iso = (ms: number) => new Date(ms).toISOString()
const HOUR = 3_600_000

describe('status order', () => {
  it('lunas hanya dari payment_status', () => {
    expect(isPaid({ payment_status: 'paid' })).toBe(true)
    expect(isPaid({ payment_status: 'pending' })).toBe(false)
  })
  it('tertutup dari status atau payment_status, termasuk ejaan lama', () => {
    expect(isClosed({ status: 'cancelled', payment_status: 'expired' })).toBe(true)
    expect(isClosed({ status: 'canceled', payment_status: 'pending' })).toBe(true)
    expect(isClosed({ status: 'pending', payment_status: 'pending' })).toBe(false)
  })
  it('order lunas tidak pernah dianggap tertutup', () => {
    expect(isClosed({ status: 'refunded', payment_status: 'paid' })).toBe(false)
  })
})

describe('tenggat order', () => {
  it('memakai expires_at bila ada, selain itu created_at + 24 jam', () => {
    expect(closesAt({ expires_at: iso(T + HOUR), created_at: iso(T) })).toBe(iso(T + HOUR))
    expect(closesAt({ expires_at: null, created_at: iso(T) })).toBe(iso(T + 24 * HOUR))
    expect(closesAt({})).toBeNull()
  })
  it('lewat tenggat dan batas membuat kode baru (5 menit terakhir)', () => {
    const order = { closes_at: iso(T + HOUR) }
    expect(isPastClosing(order, T)).toBe(false)
    expect(isPastClosing(order, T + HOUR)).toBe(true)
    expect(canCreateNewCode(order, T)).toBe(true)
    expect(canCreateNewCode(order, T + HOUR - 4 * 60_000)).toBe(false)
    expect(canCreateNewCode({ closes_at: null }, T)).toBe(true)
  })
})

describe('kode bayar', () => {
  it('kedaluwarsa dari status atau dari expires_at yang sudah lewat', () => {
    expect(isPaymentExpired({ status: 'expired', expires_at: null }, T)).toBe(true)
    expect(isPaymentExpired({ status: 'pending', expires_at: iso(T - 1) }, T)).toBe(true)
    expect(isPaymentExpired({ status: 'pending', expires_at: iso(T + 1) }, T)).toBe(false)
  })
  it('batas bayar = yang lebih dulu antara kode dan order', () => {
    expect(payBefore({ expires_at: iso(T + HOUR) }, { closes_at: iso(T + 2 * HOUR) })).toBe(T + HOUR)
    expect(payBefore({ expires_at: iso(T + 3 * HOUR) }, { closes_at: iso(T + 2 * HOUR) })).toBe(T + 2 * HOUR)
    expect(payBefore(null, { closes_at: null })).toBeNull()
  })
})
