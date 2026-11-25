import { Icon } from '@/components/ui'

/** Home page section title, with an optional note and "view all" link. */
export function SectionHeader({ title, note, href, linkLabel = 'View all' }: { title: string; note?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-[28px] leading-none text-fg sm:text-4xl">{title}</h2>
        {note && <p className="mt-2 text-sm text-fg-subtle">{note}</p>}
      </div>
      {href && (
        <a href={href} className="inline-flex shrink-0 items-center gap-1 pb-1 text-sm font-semibold text-accent hover:text-accent-strong">
          {linkLabel} <Icon name="arrow-right" className="h-4 w-4" />
        </a>
      )}
    </div>
  )
}
