'use client'

import { useState } from 'react'

import { Button, ChoiceList } from '@/components/ui'

export type MethodOption = {
  code: string
  label: string
  image: string | null
  category: string
  /** Destination account; manual transfer only. */
  bank?: { name: string; accountNumber: string; holder: string } | null
}

type Props = {
  methods: MethodOption[]
  current: string | null
  /** The same method may be chosen (e.g. the old code has expired). */
  allowSame: boolean
  busy: boolean
  onConfirm: (code: string) => Promise<boolean>
}

/** "Change payment method": method list as is from the API, then create a new payment code. */
export function MethodSwitcher({ methods, current, allowSame, busy, onConfirm }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(current ?? methods[0]?.code ?? '')

  if (!open) {
    return (
      <Button
        variant="link"
        className="mx-auto"
        onClick={() => {
          setSelected(current ?? methods[0]?.code ?? '')
          setOpen(true)
        }}
      >
        Change payment method
      </Button>
    )
  }

  return (
    <div className="space-y-3 border-t border-line-soft pt-4">
      <p className="text-sm font-medium text-fg">Choose another method</p>
      <ChoiceList
        name="ganti_metode"
        label="Payment method"
        value={selected}
        onChange={setSelected}
        disabled={busy}
        choices={methods.map((m) => ({ value: m.code, label: m.label, image: m.image }))}
      />
      <p className="text-xs text-fg-subtle">The total may change with the method you choose; the final amount is shown once the code is created.</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="lg" disabled={busy} onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          size="lg"
          disabled={busy || !selected || (selected === current && !allowSame)}
          onClick={async () => {
            if (await onConfirm(selected)) setOpen(false)
          }}
        >
          {busy ? 'Creating code…' : 'Use this method'}
        </Button>
      </div>
    </div>
  )
}
