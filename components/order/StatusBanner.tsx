import { Icon, type IconName } from '@/components/ui'
import { cn } from '@/lib/cn'

export type StatusView = 'awaiting_payment' | 'awaiting_verification' | 'delivering' | 'delivery_delayed' | 'delivered' | 'paid_no_delivery' | 'closed'

const VIEWS: Record<StatusView, { icon: IconName; tone: string; title: string; body: React.ReactNode }> = {
  awaiting_payment: {
    icon: 'clock',
    tone: 'bg-accent-soft text-accent-strong',
    title: 'Awaiting payment',
    body: 'Complete your payment below. This page updates automatically as soon as your payment arrives.',
  },
  awaiting_verification: {
    icon: 'clock',
    tone: 'bg-accent-soft text-accent-strong',
    title: 'Awaiting seller verification',
    body: 'Your transfer confirmation has been received. The seller verifies it manually, which can take a few hours.',
  },
  delivering: {
    icon: 'check-circle',
    tone: 'bg-success-soft text-success',
    title: 'Payment received',
    body: (
      <>
        Your product is being sent to the <strong>email</strong> and <strong>WhatsApp</strong> you entered when ordering, usually within a few minutes.
      </>
    ),
  },
  delivered: {
    icon: 'check-circle',
    tone: 'bg-success-soft text-success',
    title: 'Payment received, product sent',
    body: (
      <>
        Check the <strong>email</strong> and <strong>WhatsApp</strong> you entered when ordering. If you do not see it, check your spam or promotions folder too.
      </>
    ),
  },
  delivery_delayed: {
    icon: 'alert',
    tone: 'bg-warning-soft text-warning',
    title: 'Payment received, delivery delayed',
    body: (
      <>
        Your product delivery is still being processed. Check your <strong>email</strong> and <strong>WhatsApp</strong> (including the spam folder). If it still has not arrived,
        contact the store and mention the order number above.
      </>
    ),
  },
  paid_no_delivery: {
    icon: 'check-circle',
    tone: 'bg-success-soft text-success',
    title: 'Payment received',
    body: 'Thank you! We have received your order.',
  },
  closed: {
    icon: 'info',
    tone: 'bg-muted text-fg',
    title: 'Order closed',
    body: 'The payment deadline has passed or the order was cancelled. There is no need to pay for this order; please place a new order if you still want to buy.',
  },
}

export function StatusBanner({ view }: { view: StatusView }) {
  const v = VIEWS[view]
  return (
    <div className={cn('flex gap-3 rounded-xl p-4', v.tone)} role="status" aria-live="polite">
      <Icon name={v.icon} className="mt-0.5 h-6 w-6 shrink-0" />
      <div>
        <p className="font-semibold">{v.title}</p>
        <p className="mt-1 text-sm">{v.body}</p>
      </div>
    </div>
  )
}
