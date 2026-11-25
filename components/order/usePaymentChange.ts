'use client'

import { useState } from 'react'

import { changePaymentAction } from '@/app/pesanan/[ref]/actions'
import { newUuid } from '@/lib/format'
import type { PublicOrderStatus } from '@/lib/types'

/**
 * Buat kode bayar baru (kode kedaluwarsa atau ganti metode) lewat POST /orders/{ref}/payments.
 * Satu Idempotency-Key per klik; bila klik putus di tengah jalan, klik berikutnya dengan metode yang sama
 * memakai kunci yang sama, jadi tidak terbuat kode kedua.
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
      setError('Koneksi terputus sebelum kode dipastikan. Tekan tombolnya lagi; kode tidak akan dobel.')
    }
    setBusy(false)
    return ok
  }

  return { change, busy, error }
}
