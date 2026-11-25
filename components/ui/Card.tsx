import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export function Card({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('rounded-3xl border border-line bg-surface p-5 sm:p-6', className)} {...props} />
}

/** Card section title, with an optional editorial-style step number ("01", "02"). */
export function CardHeader({ title, description, step, action }: { title: ReactNode; description?: ReactNode; step?: number; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      {step !== undefined && (
        <span className="font-display text-3xl leading-none text-accent" aria-hidden="true">
          {String(step).padStart(2, '0')}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold leading-7 tracking-tight">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-fg-subtle">{description}</p>}
      </div>
      {action}
    </div>
  )
}
