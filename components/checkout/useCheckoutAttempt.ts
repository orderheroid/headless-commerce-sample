'use client'

import { useCallback, useEffect, useRef } from 'react'

import { newUuid } from '@/lib/format'

// One "checkout attempt" = two UUIDs in sessionStorage:
// - Idempotency-Key  : reused on every POST /orders retry
// - external_reference: the order id in this store, also the ref of the /pesanan/{ref} page
// Both are replaced only after the order is created successfully.

const IDEM_KEY = 'toko:checkout:idempotency-key'
const REF_KEY = 'toko:checkout:external-reference'

function readOrCreate(key: string): string {
  try {
    const existing = sessionStorage.getItem(key)
    if (existing) return existing
    const value = newUuid()
    sessionStorage.setItem(key, value)
    return value
  } catch {
    return newUuid() // sessionStorage blocked: valid while the page stays open
  }
}

export function useCheckoutAttempt() {
  const keys = useRef<{ idempotencyKey: string; externalReference: string } | null>(null)

  useEffect(() => {
    keys.current = { idempotencyKey: readOrCreate(IDEM_KEY), externalReference: readOrCreate(REF_KEY) }
  }, [])

  /** Keys for the current attempt (null before mounting in the browser). */
  const current = useCallback(() => keys.current, [])

  /**
   * Replace ONLY the Idempotency-Key. Used after the server confirms no order with this reference exists yet;
   * external_reference stays, and OrderHero keeps it unique, so a second order cannot be created.
   */
  const rotateIdempotencyKey = useCallback(() => {
    if (!keys.current) return
    const value = newUuid()
    try {
      sessionStorage.setItem(IDEM_KEY, value)
    } catch {}
    keys.current = { ...keys.current, idempotencyKey: value }
  }, [])

  /** Order created successfully: the next attempt uses a new pair of UUIDs. */
  const finish = useCallback(() => {
    try {
      sessionStorage.removeItem(IDEM_KEY)
      sessionStorage.removeItem(REF_KEY)
    } catch {}
  }, [])

  return { current, rotateIdempotencyKey, finish }
}
