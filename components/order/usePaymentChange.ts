'use client'

import { useState } from 'react'

import { changePaymentAction } from '@/app/pesanan/[ref]/actions'
import { newUuid } from '@/lib/format'
import type { PublicOrderStatus } from '@/lib/types'

/**
 * Create a new payment code (expired code or method change) via POST /orders/{ref}/payments.
 * One Idempotency-Key per click; if a click is cut off midway, the next click with the same method
 * reuses the same key, so no second code is created.
 */
export function usePaymentChange(reference: string, onUpdated: (order: PublicOrderStatus) => void) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<{ method: string; key: string } | null>(null)

  async function change(method: string): Promise<boolean> {
    if (busy || !method) return false
    setBusy(true)
    setError(null)
    const attemptKey = pending?.method === method ? pending.key : newUuid()
    let ok = false
    try {
      const result = await changePaymentAction({ reference, paymentMethod: method, attemptKey })
      setPending(null)
      if (result.ok) {
        onUpdated(result.order)
        ok = true
      } else {
        setError(result.message)
      }
    } catch {
      setPending({ method, key: attemptKey })
      setError('Connection lost before the code was confirmed. Press the button again; the code will not be duplicated.')
    }
    setBusy(false)
    return ok
  }

  return { change, busy, error }
}
