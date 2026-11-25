'use client'

import { useId, type ComponentProps } from 'react'

import { cn } from '@/lib/cn'

export const inputClass = cn(
  'block h-13 w-full rounded-2xl border bg-surface px-4 text-base text-fg placeholder:text-fg-faint',
  'outline-none transition-colors focus:border-brand-600 focus:ring-4 focus:ring-accent-soft',
  'disabled:bg-subtle disabled:text-fg-faint',
)

type FieldProps = ComponentProps<'input'> & {
  label: string
  hint?: string
  /** Pesan galat; field ditandai merah dan dibacakan pembaca layar. */
  error?: string | null
}

/** Input berlabel dengan petunjuk dan pesan galat. */
export function Field({ label, hint, error, className, id, ...props }: FieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(inputClass, error ? 'border-danger-line focus:border-danger focus:ring-danger-soft' : 'border-line-strong')}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
