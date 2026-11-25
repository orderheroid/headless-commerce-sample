import { Card, CardHeader } from '@/components/ui'
import { rupiah } from '@/lib/format'
import type { PublicOrderStatus } from '@/lib/types'

export function OrderItems({ order }: { order: PublicOrderStatus }) {
  return (
    <Card>
      <CardHeader title="Rincian pesanan" />
      <dl className="space-y-2 text-sm">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between gap-3">
            <dt className="min-w-0 text-fg-muted">
              {item.name}
              {item.variant ? ` (${item.variant})` : ''} <span className="text-fg-faint">×{item.quantity}</span>
            </dt>
            <dd className="shrink-0 tabular-nums">{rupiah(item.subtotal)}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <dt className="font-semibold">Total</dt>
          <dd className="text-lg font-bold tabular-nums text-accent">{rupiah(order.total)}</dd>
        </div>
      </dl>
    </Card>
  )
}
