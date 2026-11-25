'use client'

import { useState } from 'react'

import { cn } from '@/lib/cn'

type Props = {
  src: string | null
  /** Alternative text; '' for decorative images. Default: the product name. */
  alt?: string
  name: string
  className?: string
  /** Above-the-fold image (hero, gallery): loaded immediately with high priority. */
  eager?: boolean
}

/**
 * Product image: shimmer while loading, fades in, and the product's initial when missing or failed.
 * Uses a plain <img> because the merchant's image domains are not known in advance (next/image needs
 * `images.remotePatterns`).
 */
export function ProductImage({ src, alt, name, className, eager }: Props) {
  // The status is stored with its `src`, so a new image automatically starts from "loading".
  const [loaded, setLoaded] = useState<{ src: string | null; status: 'loaded' | 'error' } | null>(null)
  const state: 'loading' | 'loaded' | 'error' = !src ? 'error' : loaded?.src === src ? loaded.status : 'loading'
  const setState = (status: 'loaded' | 'error') => setLoaded({ src, status })

  // Images from the browser cache can finish before React mounts, so onLoad never fires:
  // check `complete` when the element mounts.
  const checkComplete = (img: HTMLImageElement | null) => {
    if (img?.complete && state === 'loading') setState(img.naturalWidth > 0 ? 'loaded' : 'error')
  }

  return (
    <div className={cn('relative overflow-hidden bg-muted', state === 'loading' && 'shimmer', className)}>
      {src && state !== 'error' && (
        <img
          ref={checkComplete}
          src={src}
          alt={alt ?? name}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={cn('h-full w-full object-cover transition-opacity duration-500 ease-out', state === 'loaded' ? 'opacity-100' : 'opacity-0')}
        />
      )}
      {state === 'error' && (
        <div className="flex h-full w-full items-center justify-center bg-accent-soft text-4xl font-bold text-accent-faint" aria-hidden="true">
          {name.trim().charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}
