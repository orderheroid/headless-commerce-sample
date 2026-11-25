import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Icon, type IconName } from './Icon'

type Tone = 'error' | 'info' | 'success' | 'neutral'

const tones: Record<Tone, { box: string; icon: IconName }> = {
  error: { box: 'border-danger-line bg-danger-soft text-danger', icon: 'alert' },
  info: { box: 'border-accent-line bg-accent-soft text-accent-strong', icon: 'info' },
  success: { box: 'border-success-line bg-success-soft text-success', icon: 'check-circle' },
  neutral: { box: 'border-line bg-subtle text-fg', icon: 'info' },
}

/** Message box. `title` is optional; the content can be text or elements. */
export function Notice({ tone = 'error', title, children, className }: { tone?: Tone; title?: ReactNode; children?: ReactNode; className?: string }) {
  const t = tones[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-2xl border px-4 py-3.5 text-sm', t.box, className)}>
      <Icon name={t.icon} className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  )
}
