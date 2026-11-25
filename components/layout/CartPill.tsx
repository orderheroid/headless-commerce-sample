'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/ui'
import { cartCount, useCart } from '@/lib/cart'
import { cn } from '@/lib/cn'

/** Pages where the pill is hidden (they already have their own action bar at the bottom of the screen). */
const HIDDEN_ON = ['/checkout', '/orders']
/** On these pages the pill only shows on wide screens (on mobile there is an "Add to cart" bar). */
const DESKTOP_ONLY_ON = ['/products']

/**
 * Floating cart pill: appears as soon as the cart has items, so checkout is always one tap away
 * from anywhere. Flashes "Added" whenever a new product goes in.
 */
export function CartPill() {
  const pathname = usePathname()
  const { items, ready } = useCart()
  const count = ready ? cartCount(items) : 0

  const previous = useRef<number | null>(null)
  const [justAdded, setJustAdded] = useState(false)
  useEffect(() => {
    if (!ready) return
    if (previous.current !== null && count > previous.current) {
      setJustAdded(true)
      const t = setTimeout(() => setJustAdded(false), 1800)
      previous.current = count
      return () => clearTimeout(t)
    }
    previous.current = count
  }, [count, ready])

  if (count === 0 || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null
  const desktopOnly = DESKTOP_ONLY_ON.some((p) => pathname.startsWith(p))

  return (
    <div className={cn('pointer-events-none fixed inset-x-0 bottom-0 z-20 justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]', desktopOnly ? 'hidden md:flex' : 'flex')}>
      <Link
        href="/checkout"
        className="pointer-events-auto flex h-14 w-full max-w-sm animate-fade-up items-center gap-3 rounded-full bg-fg pl-2 pr-5 text-canvas shadow-xl shadow-black/20 transition active:scale-[0.98]"
      >
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300', justAdded ? 'bg-pop text-black' : 'bg-brand-600 text-white')}>
          <Icon name={justAdded ? 'check' : 'cart'} className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium" aria-live="polite">
          {justAdded ? 'Added to cart' : `${count} ${count === 1 ? 'item' : 'items'} in cart`}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
          Checkout <Icon name="arrow-right" className="h-4 w-4" />
        </span>
      </Link>
    </div>
  )
}
