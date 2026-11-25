import { Notice, Skeleton } from '@/components/ui'
import { cn } from '@/lib/cn'
import { rupiah } from '@/lib/format'
import type { Quote } from '@/lib/types'

/** Ringkasan biaya. Semua angka dari respons POST /checkout/quote, tidak ada yang dihitung di sini. */
export function OrderSummary({ quote, loading, error }: { quote: Quote | null; loading: boolean; error: string | null }) {
  if (!quote) {
    if (error) return <Notice>{error}</Notice>
    return (
      <div className="space-y-3" aria-label="Menghitung total">
        <Skeleton className="h-4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-7" />
      </div>
    )
  }

  return (
    <div aria-live="polite" aria-busy={loading}>
      <dl className={cn('space-y-2 text-sm transition-opacity', loading && 'opacity-50')}>
        {quote.items.map((line, i) => (
          <Row key={i} label={<>{line.product_name} <span className="text-fg-faint">×{line.quantity}</span></>} value={rupiah(line.subtotal)} />
        ))}
        <div className="border-t border-line-soft pt-2">
          <Row label="Subtotal" value={rupiah(quote.subtotal)} />
        </div>
        {quote.bump > 0 && <Row label="Tambahan" value={rupiah(quote.bump)} />}
        {quote.discount > 0 && (
          <Row label={`Diskon${quote.coupon ? ` (${quote.coupon.code})` : ''}`} value={`−${rupiah(quote.discount)}`} className="text-success" />
        )}
        {quote.transaction_fee > 0 && <Row label="Biaya transaksi" value={rupiah(quote.transaction_fee)} />}
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <dt className="font-semibold">Total</dt>
          <dd className="text-xl font-bold tabular-nums text-accent">{rupiah(quote.total)}</dd>
        </div>
      </dl>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  )
}

function Row({ label, value, className }: { label: React.ReactNode; value: string; className?: string }) {
  return (
    <div className={cn('flex justify-between gap-3', className)}>
      <dt className="min-w-0 text-fg-muted">{label}</dt>
      <dd className="shrink-0 tabular-nums">{value}</dd>
    </div>
  )
}
