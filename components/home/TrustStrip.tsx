import { site } from '@/config/site'
import { Icon } from '@/components/ui'

/** Poin kepercayaan dari config/site.ts: baris geser di HP, tiga kolom di layar lebar. */
export function TrustStrip() {
  return (
    <ul className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:px-0">
      {site.assurances.map((a) => (
        <li key={a.text} className="flex shrink-0 items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium text-fg">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Icon name={a.icon} className="h-[18px] w-[18px]" />
          </span>
          {a.text}
        </li>
      ))}
    </ul>
  )
}
