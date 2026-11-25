import { site } from '@/config/site'
import { Icon } from '@/components/ui'
import { cn } from '@/lib/cn'

/** Poin kepercayaan dari config/site.ts (dikirim otomatis, pembayaran aman, dll.). */
export function Assurances({ className }: { className?: string }) {
  return (
    <ul className={cn('grid gap-2 text-sm text-fg-muted', className)}>
      {site.assurances.map((a) => (
        <li key={a.text} className="flex items-center gap-2.5">
          <Icon name={a.icon} className="h-5 w-5 shrink-0 text-accent" />
          {a.text}
        </li>
      ))}
    </ul>
  )
}
