'use client'

import { useState } from 'react'

import { Button, Icon, inputClass } from '@/components/ui'
import { cn } from '@/lib/cn'

type Props = {
  /** Code currently applied and accepted by the quote. */
  applied: string | null
  onApply: (code: string) => void
  onRemove: () => void
  error: string | null
  onClearError: () => void
  disabled?: boolean
}

/**
 * The coupon is sent to the quote only when "Apply" is pressed, not on every keystroke:
 * coupon checks have their own quota (20/minute per key).
 */
export function CouponField({ applied, onApply, onRemove, error, onClearError, disabled }: Props) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-success-soft px-3.5 py-2.5 text-sm text-success">
        <span className="flex items-center gap-2">
          <Icon name="tag" className="h-4 w-4" /> Coupon <strong>{applied}</strong> applied
        </span>
        <button
          type="button"
          className="font-medium underline underline-offset-2"
          onClick={() => {
            onRemove()
            setInput('')
          }}
        >
          Remove
        </button>
      </div>
    )
  }

  if (!open && !error) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 text-sm font-medium text-accent hover:underline">
        <Icon name="tag" className="h-4 w-4" /> Have a coupon code?
      </button>
    )
  }

  const apply = () => {
    const code = input.trim()
    if (code) onApply(code)
  }

  return (
    <div>
      <label htmlFor="coupon" className="mb-1.5 block text-sm font-medium text-fg">
        Coupon code
      </label>
      <div className="flex gap-2">
        <input
          id="coupon"
          className={cn(inputClass, 'uppercase', error ? 'border-danger-line' : 'border-line-strong')}
          maxLength={64}
          autoCapitalize="characters"
          autoComplete="off"
          value={input}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            setInput(e.target.value)
            onClearError()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              apply()
            }
          }}
        />
        <Button variant="secondary" size="lg" onClick={apply} disabled={!input.trim() || disabled} className="shrink-0">
          Apply
        </Button>
      </div>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  )
}
