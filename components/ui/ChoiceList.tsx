'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Icon } from './Icon'

export type Choice = {
  value: string
  label: ReactNode
  /** Teks kecil di bawah label. */
  description?: ReactNode
  /** Logo/gambar kecil di kiri (hanya layout `cards`). */
  image?: string | null
  disabled?: boolean
}

type Props = {
  name: string
  label: string
  choices: Choice[]
  value: string | null
  onChange: (value: string) => void
  disabled?: boolean
  /** `cards` = daftar bertumpuk (metode bayar); `chips` = tombol berjajar (varian). */
  layout?: 'cards' | 'chips'
}

/** Grup radio dengan tampilan kartu atau chip. Urutan pilihan dipertahankan apa adanya. */
export function ChoiceList({ name, label, choices, value, onChange, disabled, layout = 'cards' }: Props) {
  return (
    <div role="radiogroup" aria-label={label} className={layout === 'chips' ? 'flex flex-wrap gap-2' : 'grid gap-2'}>
      {choices.map((c) => {
        const selected = c.value === value
        return (
          <label
            key={c.value}
            className={cn(
              'cursor-pointer border transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
              layout === 'chips' ? 'rounded-full px-4 py-2.5 text-sm' : 'flex min-h-15 items-center gap-3 rounded-2xl px-4 py-2.5',
              selected ? 'border-brand-600 bg-accent-soft text-fg ring-1 ring-brand-600' : 'border-line-strong bg-surface hover:border-fg-faint',
              layout === 'chips' && selected && 'font-semibold',
            )}
          >
            <input type="radio" name={name} value={c.value} checked={selected} disabled={disabled || c.disabled} onChange={() => onChange(c.value)} className="sr-only" />
            {layout === 'cards' && c.image !== undefined && (
              // Logo bank/kanal dibuat untuk latar terang: tetap di kotak putih pada mode gelap.
              <span className={cn('flex h-9 w-14 shrink-0 items-center justify-center rounded-lg', c.image && 'bg-white px-1.5')}>
                {c.image && (
                  <img src={c.image} alt="" className="max-h-7 max-w-full object-contain" loading="lazy" />
                )}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className={cn('block', layout === 'cards' && 'text-sm font-medium')}>{c.label}</span>
              {c.description && <span className="block text-xs font-normal text-fg-subtle">{c.description}</span>}
            </span>
            {layout === 'cards' && (
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                  selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-line-strong text-transparent',
                )}
                aria-hidden="true"
              >
                <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            )}
          </label>
        )
      })}
    </div>
  )
}
