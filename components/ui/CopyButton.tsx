'use client'

import { useState } from 'react'

import { Button } from './Button'
import { Icon } from './Icon'

/** Tombol salin ke clipboard dengan umpan balik "Tersalin". */
export function CopyButton({ value, label = 'Salin' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="secondary"
      size="sm"
      className="shrink-0"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // clipboard ditolak browser: pembeli masih bisa menyalin manual
        }
      }}
      aria-live="polite"
    >
      <Icon name={copied ? 'check' : 'copy'} className="h-4 w-4" />
      {copied ? 'Tersalin' : label}
    </Button>
  )
}
