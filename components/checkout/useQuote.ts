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
  /** Coupon rejected by the API: the component removes the coupon, then the quote is recalculated without it. */
  onCouponRejected: (message: string) => void
}

/**
 * Checkout total from POST /checkout/quote. Recalculated with a debounce whenever the cart,
 * coupon, or payment method changes. Stale responses that arrive late are ignored.
 */
export function useQuote({ enabled, lines, paymentMethod, couponCode, onCouponRejected }: Options) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  /** Input key whose result has arrived. Different from the current key = still calculating. */
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
    let cancelled = false // input changed: stale response is ignored
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    const timer = setTimeout(async () => {
      const result = await quoteAction({ items: JSON.parse(linesKey) as CartLine[], paymentMethod: paymentMethod || undefined, couponCode: couponCode ?? undefined }).catch(
        () => ({ ok: false as const, code: 'NETWORK_ERROR', message: 'Connection lost. Check your internet and try again.', retryAfter: undefined }),
      )
      if (cancelled) return

      if (result.ok) {
        setQuote(result.quote)
        setError(null)
        setSettledKey(inputKey)
        return
      }
      if (result.code === 'COUPON_INVALID' || result.code === 'COUPON_LIMIT_REACHED') {
        rejectRef.current(result.message) // coupon removed, then recalculated without it
        return
      }
      setQuote(null) // the old total must not be used to pay
      setError(result.message)
      if (result.code === 'RATE_LIMITED' && result.retryAfter) {
        retryTimer = setTimeout(() => setNonce((n) => n + 1), result.retryAfter * 1000) // honor Retry-After
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

  /** Force a recalculation (e.g. after OUT_OF_STOCK when creating the order). */
  const refresh = () => setNonce((n) => n + 1)

  return { quote, error, loading, refresh }
}
