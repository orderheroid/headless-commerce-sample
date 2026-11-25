'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

/** Jam yang diperbarui berkala (untuk hitung mundur dan batas waktu). */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

/**
 * Tampilkan daftar panjang sedikit demi sedikit: `visible` bertambah `pageSize` setiap elemen penjaga
 * (`sentinelRef`) mendekati layar. Kembali ke halaman pertama setiap `resetKey` berubah (mis. filter).
 */
export function useInfiniteList(total: number, pageSize: number, resetKey: unknown) {
  const [visible, setVisible] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Reset saat filter berubah, dilakukan saat render (pola React untuk "state mengikuti prop").
  const [lastKey, setLastKey] = useState(resetKey)
  if (lastKey !== resetKey) {
    setLastKey(resetKey)
    setVisible(pageSize)
  }

  const hasMore = visible < total
  const loadMore = useCallback(() => setVisible((v) => Math.min(v + pageSize, total)), [pageSize, total])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && loadMore(), { rootMargin: '600px 0px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore, visible])

  return { visible: Math.min(visible, total), hasMore, loadMore, sentinelRef }
}

/** true setelah komponen terpasang di browser (hindari kedip isi localStorage saat hidrasi). */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribeNever, () => true, () => false)
}

const subscribeNever = () => () => {}
