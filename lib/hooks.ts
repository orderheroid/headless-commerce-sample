'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

/** A clock that updates periodically (for countdowns and deadlines). */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

/**
 * Show a long list a bit at a time: `visible` grows by `pageSize` each time the sentinel element
 * (`sentinelRef`) nears the viewport. Returns to the first page whenever `resetKey` changes (e.g. a filter).
 */
export function useInfiniteList(total: number, pageSize: number, resetKey: unknown) {
  const [visible, setVisible] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Reset when the filter changes, done during render (the React pattern for "state follows prop").
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

/** true once the component has mounted in the browser (avoids a flash of localStorage content during hydration). */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribeNever, () => true, () => false)
}

const subscribeNever = () => () => {}
