import Link from 'next/link'

import { CartButton } from './CartButton'
import { ThemeToggle } from './ThemeToggle'

export function SiteHeader({ storeName }: { storeName: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-baseline gap-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={`${storeName}, home page`}
        >
          <span className="truncate font-display text-xl leading-none text-fg sm:text-2xl">{storeName}</span>
          <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
        </Link>
        <nav className="flex items-center gap-0.5" aria-label="Menu">
          <ThemeToggle />
          <CartButton />
        </nav>
      </div>
    </header>
  )
}
