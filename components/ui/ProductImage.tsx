'use client'

import { useState } from 'react'

import { cn } from '@/lib/cn'

type Props = {
  src: string | null
  /** Teks alternatif; '' untuk gambar dekoratif. Bawaan: nama produk. */
  alt?: string
  name: string
  className?: string
  /** Gambar di atas lipatan (hero, galeri): dimuat langsung dengan prioritas tinggi. */
  eager?: boolean
}

/**
 * Gambar produk: shimmer saat dimuat, muncul dengan fade, dan huruf awal produk bila tidak ada atau gagal.
 * Memakai <img> biasa karena domain gambar merchant tidak diketahui sebelumnya (next/image butuh
 * `images.remotePatterns`).
 */
export function ProductImage({ src, alt, name, className, eager }: Props) {
  // Status disimpan bersama `src`-nya, jadi gambar baru otomatis mulai dari "loading".
  const [loaded, setLoaded] = useState<{ src: string | null; status: 'loaded' | 'error' } | null>(null)
  const state: 'loading' | 'loaded' | 'error' = !src ? 'error' : loaded?.src === src ? loaded.status : 'loading'
  const setState = (status: 'loaded' | 'error') => setLoaded({ src, status })

  // Gambar dari cache browser bisa selesai sebelum React terpasang, jadi onLoad tidak terpanggil:
  // periksa `complete` saat elemen terpasang.
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
