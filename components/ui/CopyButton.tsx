'use client'

import { useState } from 'react'

import { Button } from './Button'
import { Icon } from './Icon'

/** Copy-to-clipboard button with "Copied" feedback. */
export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
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
          // clipboard denied by the browser: the buyer can still copy manually
        }
      }}
      aria-live="polite"
    >
      <Icon name={copied ? 'check' : 'copy'} className="h-4 w-4" />
      {copied ? 'Copied' : label}
    </Button>
  )
}
