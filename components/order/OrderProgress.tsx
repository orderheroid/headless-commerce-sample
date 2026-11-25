import { Icon } from '@/components/ui'
import { cn } from '@/lib/cn'

export type Stage = 'awaiting_payment' | 'delivering' | 'delivered'

const STEPS = [
  { key: 'created', label: 'Order placed' },
  { key: 'paid', label: 'Payment' },
  { key: 'delivered', label: 'Product sent' },
] as const

/** Steps 1–3. `stage` determines which steps are done and which one is in progress. */
export function OrderProgress({ stage }: { stage: Stage }) {
  const doneCount = stage === 'awaiting_payment' ? 1 : stage === 'delivering' ? 2 : 3
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i < doneCount
        const current = i === doneCount
        return (
          <li key={step.key} className="flex flex-col items-center gap-1.5 text-center" aria-current={current ? 'step' : undefined}>
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                done ? 'bg-brand-600 text-white' : current ? 'border-2 border-brand-600 bg-surface text-accent' : 'border-2 border-line bg-surface text-fg-faint',
              )}
            >
              {done ? <Icon name="check" className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn('text-xs', done || current ? 'font-medium text-fg' : 'text-fg-faint')}>{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}
