import Link from 'next/link'

import { site } from '@/config/site'

export function SiteFooter({ storeName }: { storeName: string }) {
  return (
    <footer className="mt-16 border-t border-line">
      {/* Extra bottom space so the floating cart pill does not cover the footer content. */}
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-28 pt-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-3xl leading-none text-fg">{storeName}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg-subtle">{site.footer}</p>
        </div>
        <nav className="flex gap-5 text-sm font-medium text-fg-muted" aria-label="Footer links">
          <Link href="/" className="hover:text-fg">
            Products
          </Link>
          <Link href="/#how-to-buy" className="hover:text-fg">
            How to buy
          </Link>
          <Link href="/checkout" className="hover:text-fg">
            Cart
          </Link>
        </nav>
      </div>
    </footer>
  )
}
