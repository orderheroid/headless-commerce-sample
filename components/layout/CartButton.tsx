'use client'

import Link from 'next/link'

import { Icon } from '@/components/ui'
import { cartCount, useCart } from '@/lib/cart'

/** Ikon keranjang di header dengan jumlah barang. */
export function CartButton() {
  const { items, ready } = useCart()
  const count = ready ? cartCount(items) : 0
  return (
    <Link
      href="/checkout"
      aria-label={count > 0 ? `Keranjang, ${count} barang` : 'Keranjang'}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <Icon name="cart" className="h-[22px] w-[22px]" />
      {count > 0 && (
        <span
          key={count} // animasi ulang setiap jumlah berubah
          className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] animate-fade-up items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-canvas"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
