'use client'

import { useCallback, useEffect, useRef } from 'react'

import { newUuid } from '@/lib/format'

// Satu "percobaan checkout" = dua UUID di sessionStorage (aturan 4):
// - Idempotency-Key  : dipakai ulang di setiap retry POST /orders
// - external_reference: id order di toko ini, juga ref halaman /pesanan/{ref}
// Keduanya baru diganti setelah order berhasil dibuat.

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
    return newUuid() // sessionStorage diblokir: berlaku selama halaman terbuka
  }
}

export function useCheckoutAttempt() {
  const keys = useRef<{ idempotencyKey: string; externalReference: string } | null>(null)

  useEffect(() => {
    keys.current = { idempotencyKey: readOrCreate(IDEM_KEY), externalReference: readOrCreate(REF_KEY) }
  }, [])

  /** Kunci untuk percobaan saat ini (null sebelum terpasang di browser). */
  const current = useCallback(() => keys.current, [])

  /**
   * Ganti HANYA Idempotency-Key. Dipakai setelah server memastikan order dengan referensi ini belum ada;
   * external_reference tetap, dan OrderHero menjaganya unik, jadi tidak mungkin terbuat order kedua.
   */
  const rotateIdempotencyKey = useCallback(() => {
    if (!keys.current) return
    const value = newUuid()
    try {
      sessionStorage.setItem(IDEM_KEY, value)
    } catch {}
    keys.current = { ...keys.current, idempotencyKey: value }
  }, [])

  /** Order berhasil dibuat: percobaan berikutnya memakai pasangan UUID baru. */
  const finish = useCallback(() => {
    try {
      sessionStorage.removeItem(IDEM_KEY)
      sessionStorage.removeItem(REF_KEY)
    } catch {}
  }, [])

  return { current, rotateIdempotencyKey, finish }
}
