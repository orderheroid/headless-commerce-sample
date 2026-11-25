import { cn } from '@/lib/cn'
import { rupiah } from '@/lib/format'

type Props = {
  amount: number
  /** Strikethrough price; shown only when greater than `amount`. */
  compareAt?: number | null
  /** Small prefix, e.g. "from". */
  prefix?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'text-[15px]', md: 'text-xl', lg: 'text-3xl tracking-tight' }

/** Catalog price for display. The amount charged always comes from the quote, not from here. */
export function Price({ amount, compareAt, prefix, size = 'sm', className }: Props) {
  const discounted = compareAt != null && compareAt > amount
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2', className)}>
      {prefix && <span className="text-xs font-normal text-fg-subtle">{prefix}</span>}
      <span className={cn('font-bold tabular-nums text-fg', sizes[size])}>{amount === 0 ? 'Free' : rupiah(amount)}</span>
      {discounted && <span className="text-sm tabular-nums text-fg-faint line-through">{rupiah(compareAt)}</span>}
    </div>
  )
}
