import { cn } from '@/lib/cn'
import { rupiah } from '@/lib/format'

type Props = {
  amount: number
  /** Harga coret; tampil hanya bila lebih besar dari `amount`. */
  compareAt?: number | null
  /** Awalan kecil, mis. "mulai". */
  prefix?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'text-[15px]', md: 'text-xl', lg: 'text-3xl tracking-tight' }

/** Harga katalog untuk tampilan. Angka yang ditagih selalu dari quote, bukan dari sini. */
export function Price({ amount, compareAt, prefix, size = 'sm', className }: Props) {
  const discounted = compareAt != null && compareAt > amount
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2', className)}>
      {prefix && <span className="text-xs font-normal text-fg-subtle">{prefix}</span>}
      <span className={cn('font-bold tabular-nums text-fg', sizes[size])}>{amount === 0 ? 'Gratis' : rupiah(amount)}</span>
      {discounted && <span className="text-sm tabular-nums text-fg-faint line-through">{rupiah(compareAt)}</span>}
    </div>
  )
}
