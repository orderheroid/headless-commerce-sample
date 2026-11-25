import { describe, expect, it } from 'vitest'

import { toPublicStatus } from '@/lib/order-public'
import type { OrderResult } from '@/lib/types'

/** Full API response, including buyer data that must NOT reach the browser. */
function apiResult(overrides: Record<string, unknown> = {}): OrderResult {
  return {
    order: {
      id: 'o1',
      order_number: 'FO26TEST',
      external_reference: 'ref',
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'QRIS',
      customer: { name: 'Budi Rahasia', email: 'budi@rahasia.com', phone: '6281200000000', address: 'Jl. Rahasia 1' },
      items: [{ product_name: 'E-book', variant_name: null, quantity: 1, price: 50000, subtotal: 50000 }],
      amounts: { currency: 'IDR', total: 50000 },
      created_at: '2026-11-25T00:00:00.000Z',
      expires_at: '2026-11-26T00:00:00.000Z',
      delivery: { status: 'pending' },
      ...overrides,
    },
    payment: { status: 'pending', method_code: 'QRIS', amount: 50000, payment_url: 'https://gateway.example/pay', virtual_account: null, qris_payload: '000201…', expires_at: '2026-11-25T23:59:00.000Z' },
    payment_page_url: 'https://orderhero.id/payment/pay/FO26TEST',
  } as unknown as OrderResult
}

describe('toPublicStatus', () => {
  it('never passes on buyer data', () => {
    const json = JSON.stringify(toPublicStatus(apiResult()))
    for (const secret of ['Budi Rahasia', 'budi@rahasia.com', '6281200000000', 'Jl. Rahasia', 'customer']) expect(json).not.toContain(secret)
  })
  it('contains only the allowed fields', () => {
    expect(Object.keys(toPublicStatus(apiResult())).sort()).toEqual(
      ['closes_at', 'delivery_status', 'digital_delivered', 'items', 'order_number', 'paid_at', 'payment', 'payment_method', 'payment_page_url', 'payment_status', 'status', 'total', 'transfer', 'unique_code'].sort(),
    )
  })
  it('hides the gateway payment_url when there is a QR or code', () => {
    expect(toPublicStatus(apiResult()).payment?.payment_url).toBeNull()
  })
  it('transfer confirmation: only status and reason, without sender name or proof', () => {
    const result = {
      ...apiResult({ payment_method: 'm_abc', amounts: { currency: 'IDR', total: 50123, unique_code: 123 } }),
      payment: null,
      transfer_confirmation: { id: 't1', status: 'rejected', sender_name: 'Budi Rahasia', proof_url: 'https://cdn.example/bukti.jpg', amount: 50123, rejection_reason: 'Nominal tidak cocok' },
    } as unknown as OrderResult
    const out = toPublicStatus(result)
    expect(out.transfer).toEqual({ status: 'rejected', rejection_reason: 'Nominal tidak cocok' })
    expect(out.unique_code).toBe(123)
    expect(out.total).toBe(50123)
    expect(JSON.stringify(out)).not.toMatch(/Budi Rahasia|bukti\.jpg/)
  })
  it('without transfer confirmation: transfer is null and unique code is 0', () => {
    const out = toPublicStatus(apiResult())
    expect(out.transfer).toBeNull()
    expect(out.unique_code).toBe(0)
  })
  it('hides payment instructions once paid or closed', () => {
    for (const o of [{ payment_status: 'paid' }, { status: 'cancelled' }]) {
      const out = toPublicStatus(apiResult(o))
      expect(out.payment).toBeNull()
      expect(out.payment_page_url).toBeNull()
    }
  })
})
