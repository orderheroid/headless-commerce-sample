'use client'

import { cn } from '@/lib/cn'

import { Icon } from './Icon'

type Props = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  /** For screen readers, e.g. the product name. */
  label?: string
  size?: 'sm' | 'md'
}

export function QuantityStepper({ value, onChange, min = 1, max = 100, disabled, label = 'Quantity', size = 'md' }: Props) {
  const btn = cn(
    'flex items-center justify-center rounded-full text-fg transition-colors hover:bg-muted disabled:text-fg-faint disabled:hover:bg-transparent',
    size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
  )
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface p-1" role="group" aria-label={label}>
      <button type="button" className={btn} disabled={disabled || value <= min} onClick={() => onChange(value - 1)} aria-label={`Decrease ${label}`}>
        <Icon name="minus" className="h-4 w-4" />
      </button>
      <span className={cn('text-center font-semibold tabular-nums', size === 'sm' ? 'w-6 text-sm' : 'w-8')} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label={`Increase ${label}`}>
        <Icon name="plus" className="h-4 w-4" />
      </button>
    </div>
  )
}
