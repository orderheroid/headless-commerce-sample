'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { orderStatusConfig } from '@/config/site'
import { isClosed, isPaid, isPastClosing } from '@/lib/order-status'
import type { PublicOrderStatus } from '@/lib/types'

type Fetched = { kind: 'ok'; order: PublicOrderStatus } | { kind: 'error'; message: string; notFound: boolean; retryAfter?: number }

/** Baca status lewat route handler milik toko ini, bukan langsung ke OrderHero. */
async function fetchStatus(reference: string): Promise<Fetched> {
  try {
    const res = await fetch(`/api/pesanan/${reference}`, { cache: 'no-store' })
    const data = await res.json().catch(() => null)
    if (res.ok && data?.ok) return { kind: 'ok', order: data.order }
    return {
      kind: 'error',
      message: data?.message ?? 'Status pesanan belum bisa dimuat.',
      notFound: res.status === 404,
      retryAfter: Number(res.headers.get('retry-after')) || undefined,
    }
  } catch {
    return { kind: 'error', message: 'Koneksi terputus. Kami akan mencoba lagi.', notFound: false }
  }
}

/** Order selesai dipantau: lunas, tertutup, atau sudah lewat tenggat + masa tenggang. */
function isFinal(order: PublicOrderStatus): boolean {
  return isPaid(order) || isClosed(order) || isPastClosing(order, Date.now() - orderStatusConfig.graceAfterCloseMs)
}

/** Order yang baru dibuat bisa belum terbaca sesaat; dianggap tidak ada setelah sekian kali 404. */
const MAX_NOT_FOUND = 3

/**
 * Polling status pesanan tiap `pollMs`. Berhenti saat lunas/tertutup, jeda saat tab tidak terlihat,
 * menghormati Retry-After, dan diganti tombol manual setelah `maxPollMs`.
 */
export function useOrderPolling(reference: string) {
  const [order, setOrder] = useState<PublicOrderStatus | null>(null)
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null)
  const [stopped, setStopped] = useState(false)
  const [checking, setChecking] = useState(false)
  const done = useRef(false)

  /** Terapkan status baru (dari polling atau dari aksi ganti metode). */
  const update = useCallback((next: PublicOrderStatus) => {
    setOrder(next)
    setError(null)
    if (isFinal(next)) done.current = true
  }, [])

  useEffect(() => {
    const startedAt = Date.now()
    const withinWindow = () => Date.now() - startedAt <= orderStatusConfig.maxPollMs
    let timer: ReturnType<typeof setTimeout> | undefined
    let inFlight = false
    let notFoundCount = 0
    let disposed = false
    done.current = false

    async function poll() {
      clearTimeout(timer)
      if (inFlight || done.current || disposed) return
      inFlight = true
      const result = await fetchStatus(reference)
      inFlight = false
      if (disposed) return
      let delay: number = orderStatusConfig.pollMs

      if (result.kind === 'ok') {
        notFoundCount = 0
        update(result.order)
        if (done.current) return
      } else {
        if (result.notFound) notFoundCount += 1
        const giveUp = result.notFound && notFoundCount >= MAX_NOT_FOUND
        if (!result.notFound || giveUp) setError({ message: result.message, notFound: result.notFound })
        if (giveUp) {
          done.current = true
          return
        }
        if (result.retryAfter) delay = Math.max(delay, result.retryAfter * 1000) // hormati Retry-After
      }

      if (!withinWindow()) {
        setStopped(true)
        return
      }
      if (!document.hidden) timer = setTimeout(poll, delay)
    }

    // Jeda saat tab tidak aktif; lanjut lagi saat dibuka.
    const onVisibility = () => {
      if (document.hidden) clearTimeout(timer)
      else if (withinWindow()) poll()
    }

    poll()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', onVisibility)
      clearTimeout(timer)
    }
  }, [reference, update])

  /** Periksa sekali secara manual (setelah polling otomatis berhenti). */
  const checkNow = useCallback(async () => {
    setChecking(true)
    const result = await fetchStatus(reference)
    if (result.kind === 'ok') update(result.order)
    else setError({ message: result.message, notFound: result.notFound })
    setChecking(false)
  }, [reference, update])

  return { order, error, stopped, checking, checkNow, update }
}
