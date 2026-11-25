'use client'

import { useEffect, useRef, useState } from 'react'

import { quoteAction } from '@/app/checkout/actions'
import { checkoutConfig } from '@/config/site'
import type { CartLine, Quote } from '@/lib/types'

type Options = {
  enabled: boolean
  lines: CartLine[]
  paymentMethod: string
  couponCode: string | null
  /** Kupon ditolak API: komponen menghapus kupon, lalu quote dihitung ulang tanpa kupon. */
  onCouponRejected: (message: string) => void
}

/**
 * Total checkout dari POST /checkout/quote (aturan 2). Dihitung ulang dengan jeda setiap keranjang,
 * kupon, atau metode bayar berubah. Jawaban lama yang datang terlambat diabaikan.
 */
export function useQuote({ enabled, lines, paymentMethod, couponCode, onCouponRejected }: Options) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  /** Kunci masukan yang hasilnya sudah datang. Berbeda dari kunci sekarang = sedang menghitung. */
  const [settledKey, setSettledKey] = useState<string | null>(null)

  const linesKey = JSON.stringify(lines)
  const inputKey = `${linesKey}|${paymentMethod}|${couponCode ?? ''}|${nonce}`
  const active = enabled && lines.length > 0
  const loading = active && settledKey !== inputKey

  const rejectRef = useRef(onCouponRejected)
  useEffect(() => {
    rejectRef.current = onCouponRejected
  })

  useEffect(() => {
    if (!active) return
    let cancelled = false // masukan berubah: jawaban lama diabaikan
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    const timer = setTimeout(async () => {
      const result = await quoteAction({ items: JSON.parse(linesKey) as CartLine[], paymentMethod: paymentMethod || undefined, couponCode: couponCode ?? undefined }).catch(
        () => ({ ok: false as const, code: 'NETWORK_ERROR', message: 'Koneksi terputus. Periksa internetmu lalu coba lagi.', retryAfter: undefined }),
      )
      if (cancelled) return

      if (result.ok) {
        setQuote(result.quote)
        setError(null)
        setSettledKey(inputKey)
        return
      }
      if (result.code === 'COUPON_INVALID' || result.code === 'COUPON_LIMIT_REACHED') {
        rejectRef.current(result.message) // kupon dihapus, lalu dihitung ulang tanpa kupon
        return
      }
      setQuote(null) // total lama tidak boleh dipakai untuk membayar
      setError(result.message)
      if (result.code === 'RATE_LIMITED' && result.retryAfter) {
        retryTimer = setTimeout(() => setNonce((n) => n + 1), result.retryAfter * 1000) // hormati Retry-After
      } else {
        setSettledKey(inputKey)
      }
    }, checkoutConfig.quoteDebounceMs)

    return () => {
      cancelled = true
      clearTimeout(timer)
      clearTimeout(retryTimer)
    }
  }, [active, inputKey, linesKey, paymentMethod, couponCode])

  /** Hitung ulang paksa (mis. setelah OUT_OF_STOCK saat membuat order). */
  const refresh = () => setNonce((n) => n + 1)

  return { quote, error, loading, refresh }
}
