'use client'

import { useState } from 'react'

import { Button, ChoiceList } from '@/components/ui'

export type MethodOption = {
  code: string
  label: string
  image: string | null
  category: string
  /** Rekening tujuan; hanya untuk transfer manual. */
  bank?: { name: string; accountNumber: string; holder: string } | null
}

type Props = {
  methods: MethodOption[]
  current: string | null
  /** Boleh memilih metode yang sama (mis. kode lama sudah kedaluwarsa). */
  allowSame: boolean
  busy: boolean
  onConfirm: (code: string) => Promise<boolean>
}

/** "Ganti metode pembayaran": daftar metode apa adanya dari API, lalu buat kode bayar baru. */
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
        Ganti metode pembayaran
      </Button>
    )
  }

  return (
    <div className="space-y-3 border-t border-line-soft pt-4">
      <p className="text-sm font-medium text-fg">Pilih metode lain</p>
      <ChoiceList
        name="ganti_metode"
        label="Metode pembayaran"
        value={selected}
        onChange={setSelected}
        disabled={busy}
        choices={methods.map((m) => ({ value: m.code, label: m.label, image: m.image }))}
      />
      <p className="text-xs text-fg-subtle">Total bisa berubah mengikuti metode yang dipilih; angka akhirnya tampil setelah kode dibuat.</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="lg" disabled={busy} onClick={() => setOpen(false)}>
          Batal
        </Button>
        <Button
          size="lg"
          disabled={busy || !selected || (selected === current && !allowSame)}
          onClick={async () => {
            if (await onConfirm(selected)) setOpen(false)
          }}
        >
          {busy ? 'Membuat kode…' : 'Gunakan'}
        </Button>
      </div>
    </div>
  )
}
