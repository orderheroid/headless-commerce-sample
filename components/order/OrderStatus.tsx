'use client'

import { orderStatusConfig } from '@/config/site'
import { Button, ButtonLink, Card, CopyButton, Notice, Skeleton } from '@/components/ui'
import { useNow } from '@/lib/hooks'
import { isClosed, isPaid, isPastClosing } from '@/lib/order-status'
import type { PublicOrderStatus } from '@/lib/types'

import type { MethodOption } from './MethodSwitcher'
import { OrderItems } from './OrderItems'
import { OrderProgress, type Stage } from './OrderProgress'
import { PaymentPanel } from './PaymentPanel'
import { StatusBanner, type StatusView } from './StatusBanner'
import { useOrderPolling } from './useOrderPolling'

/** Derive the view from the API status. The only place for the UI's "paid / delivered / closed" rules. */
function viewOf(order: PublicOrderStatus, now: number): StatusView {
  if (isPaid(order)) {
    switch (order.delivery_status) {
      case 'delivered':
        return 'delivered'
      case 'delayed':
        return 'delivery_delayed'
      case 'not_applicable':
        return 'paid_no_delivery'
      case 'pending':
      case 'processing':
        return 'delivering'
      default: {
        // Response without `delivery.status`: use digital_delivered + time since paid.
        if (order.digital_delivered) return 'delivered'
        const paidAt = order.paid_at ? Date.parse(order.paid_at) : null
        return paidAt !== null && now - paidAt > orderStatusConfig.deliverySlowMs ? 'delivery_delayed' : 'delivering'
      }
    }
  }
  // A cron closes the order after the deadline; until it runs the status is still pending.
  if (isClosed(order) || isPastClosing(order, now)) return 'closed'
  return order.transfer?.status === 'pending' ? 'awaiting_verification' : 'awaiting_payment'
}

const STAGE: Record<StatusView, Stage | null> = {
  awaiting_payment: 'awaiting_payment',
  awaiting_verification: 'awaiting_payment',
  delivering: 'delivering',
  delivery_delayed: 'delivering',
  delivered: 'delivered',
  paid_no_delivery: 'delivered',
  closed: null,
}

export function OrderStatus({ reference, methods }: { reference: string; methods: MethodOption[] }) {
  const { order, error, stopped, checking, checkNow, update } = useOrderPolling(reference)
  const now = useNow(15_000)

  if (!order) {
    if (error) {
      return (
        <div className="mx-auto max-w-xl space-y-4">
          <Notice title={error.notFound ? 'Order not found' : undefined}>
            {error.notFound ? 'Double-check the link you opened.' : error.message}
          </Notice>
          <ButtonLink href="/" variant="secondary">
            Back to store
          </ButtonLink>
        </div>
      )
    }
    return (
      <div className="mx-auto max-w-xl space-y-4" aria-label="Loading order status">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    )
  }

  const view = viewOf(order, now)
  const stage = STAGE[view]
  const unpaid = view === 'awaiting_payment' || view === 'awaiting_verification'

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Card className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-fg-subtle">Order number</p>
            <p className="truncate text-xl font-bold tracking-wide">{order.order_number ?? '—'}</p>
          </div>
          {order.order_number && <CopyButton value={order.order_number} />}
        </div>
        {stage && <OrderProgress stage={stage} />}
        <StatusBanner view={view} />
        {unpaid && stopped && (
          <Button variant="secondary" size="lg" block onClick={checkNow} disabled={checking}>
            {checking ? 'Checking…' : "I've paid, check status"}
          </Button>
        )}
        {error && <p className="text-sm text-danger">{error.message}</p>}
      </Card>

      {unpaid && <PaymentPanel reference={reference} order={order} methods={methods} onUpdated={update} />}

      <OrderItems order={order} />

      <ButtonLink href="/" variant="ghost" block>
        Back to store
      </ButtonLink>
    </div>
  )
}
