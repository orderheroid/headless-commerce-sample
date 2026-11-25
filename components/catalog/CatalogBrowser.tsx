'use client'

import { useDeferredValue, useMemo, useState } from 'react'

import { site } from '@/config/site'
import { Button, Icon } from '@/components/ui'
import type { ProductSummary } from '@/lib/catalog'
import { cn } from '@/lib/cn'
import { useInfiniteList } from '@/lib/hooks'

import { ProductCard } from './ProductCard'

/** Number of products per scroll step. The data is already complete in the browser; this limits DOM content and images. */
const PAGE_SIZE = site.home.pageSize

/**
 * Catalog: search and categories stick below the header while scrolling, then a product grid that
 * grows automatically (infinite scroll). Catalog data is already cached on the server; no extra API
 * calls are made from here.
 */
export function CatalogBrowser({ products }: { products: ProductSummary[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(query)

  const categories = useMemo(() => {
    const seen = new Map<string, { name: string; count: number }>()
    for (const p of products) {
      if (!p.category) continue
      const entry = seen.get(p.category.id)
      if (entry) entry.count += 1
      else seen.set(p.category.id, { name: p.category.name, count: 1 })
    }
    return [...seen].map(([id, v]) => ({ id, ...v }))
  }, [products])

  const shown = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase()
    return products.filter(
      (p) => (!category || p.category?.id === category) && (!q || p.name.toLowerCase().includes(q) || p.summary?.toLowerCase().includes(q)),
    )
  }, [products, category, deferredQuery])

  // Back to the first page whenever the search or category changes.
  const { visible, hasMore, loadMore, sentinelRef } = useInfiniteList(shown.length, PAGE_SIZE, `${category}|${deferredQuery}`)

  const reset = () => {
    setQuery('')
    setCategory(null)
  }

  return (
    <div>
      {/* Search + category bar: sticks right below the header (h-14 on mobile, h-16 on wide screens). */}
      <div className="sticky top-14 z-20 -mx-4 space-y-2.5 bg-canvas/90 px-4 py-3 backdrop-blur-md sm:top-16 sm:-mx-6 sm:px-6">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-faint" />
          <input
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={site.home.searchPlaceholder}
            aria-label="Search products"
            className="h-12 w-full rounded-full border border-line-strong bg-surface pl-12 pr-11 text-base text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-brand-600 focus:ring-4 focus:ring-accent-soft [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-fg-subtle hover:bg-muted hover:text-fg"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          )}
        </div>

        {categories.length > 1 && (
          <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6" role="group" aria-label="Category filter">
            <Chip selected={category === null} onClick={() => setCategory(null)} count={products.length}>
              All
            </Chip>
            {categories.map((c) => (
              <Chip key={c.id} selected={category === c.id} onClick={() => setCategory(c.id)} count={c.count}>
                {c.name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="font-display text-3xl text-fg">Nothing found</p>
          <p className="mt-2 text-sm text-fg-subtle">Try another keyword or category.</p>
          <Button variant="secondary" className="mt-5" onClick={reset}>
            Show all products
          </Button>
        </div>
      ) : (
        <>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {shown.slice(0, visible).map((p, i) => (
              // Cards from a new scroll step appear one after another (stagger).
              <li key={p.id} className="animate-fade-up" style={{ animationDelay: `${(i % PAGE_SIZE) * 35}ms` }}>
                <ProductCard product={p} priority={i < 4} />
              </li>
            ))}
          </ul>

          <div ref={sentinelRef} className="flex flex-col items-center gap-3 pt-10" aria-live="polite">
            {hasMore ? (
              <Button variant="secondary" onClick={loadMore}>
                Load more
              </Button>
            ) : (
              <p className="text-sm text-fg-subtle">
                {shown.length} {category || deferredQuery ? 'matching ' : ''}
                {shown.length === 1 ? 'product' : 'products'}, that&apos;s all.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Chip({ selected, onClick, count, children }: { selected: boolean; onClick: () => void; count: number; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        selected ? 'border-fg bg-fg text-canvas' : 'border-line-strong bg-surface text-fg-muted hover:border-fg hover:text-fg',
      )}
    >
      {children}
      <span className={cn('text-xs tabular-nums', selected ? 'opacity-70' : 'text-fg-faint')}>{count}</span>
    </button>
  )
}
