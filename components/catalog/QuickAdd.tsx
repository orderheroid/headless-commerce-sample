'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Icon } from '@/components/ui'
import { addToCart } from '@/lib/cart'
import type { ProductSummary } from '@/lib/catalog'
import { cn } from '@/lib/cn'

const base =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

/**
 * Tombol "+" di kartu produk: langsung masuk keranjang tanpa membuka halaman produk.
 * Produk yang butuh pilihan (varian, harga bebas) atau habis diarahkan ke halaman produknya.
 */
export function QuickAdd({ product }: { product: ProductSummary }) {
  const [added, setAdded] = useState(false)
  const needsDetail = product.hasVariants || product.pwywMin !== null || product.soldOut

  if (needsDetail) {
    return (
      <Link href={`/produk/${encodeURIComponent(product.slug)}`} aria-label={`Lihat ${product.name}`} className={cn(base, 'border border-line-strong text-fg hover:border-fg')}>
        <Icon name="arrow-up-right" className="h-[18px] w-[18px]" />
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-label={added ? `${product.name} ditambahkan` : `Tambah ${product.name} ke keranjang`}
      onClick={() => {
        addToCart({ productId: product.id, variantId: null, quantity: 1, name: product.name, variantName: null, image: product.image, slug: product.slug })
        setAdded(true)
        setTimeout(() => setAdded(false), 1600)
      }}
      className={cn(base, added ? 'bg-success text-canvas' : 'bg-fg text-canvas hover:bg-brand-600 hover:text-white')}
    >
      <Icon name={added ? 'check' : 'plus'} className="h-[18px] w-[18px]" strokeWidth={2.4} />
    </button>
  )
}
