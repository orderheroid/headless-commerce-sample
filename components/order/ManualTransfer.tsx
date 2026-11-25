'use client'

import { useState } from 'react'

import { confirmTransferAction } from '@/app/orders/[ref]/actions'
import { orderStatusConfig } from '@/config/site'
import { Button, CopyButton, Field, Notice } from '@/components/ui'
import { rupiah } from '@/lib/format'
import type { PublicOrderStatus } from '@/lib/types'

import type { MethodOption } from './MethodSwitcher'

type Props = {
  reference: string
  order: PublicOrderStatus
  /** Destination account from GET /checkout/payment-methods (MANUAL_TRANSFER category). */
  bank: NonNullable<MethodOption['bank']>
  onUpdated: (order: PublicOrderStatus) => void
}

const MAX_MB = Math.floor(orderStatusConfig.proofMaxBytes / (1024 * 1024))

/**
 * Manual bank transfer: destination account, exact amount (including the unique code), then "I've made the transfer".
 * The order is only paid once the merchant verifies it in the dashboard, which can take hours.
 */
export function ManualTransfer({ reference, order, bank, onUpdated }: Props) {
  const [senderName, setSenderName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmation = order.transfer
  const fileTooBig = !!file && file.size > orderStatusConfig.proofMaxBytes

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy || fileTooBig) return
    if (senderName.trim().length < 2) {
      setError('Enter the name of the sending account holder.')
      return
    }
    setBusy(true)
    setError(null)
    const form = new FormData()
    form.set('reference', reference)
    form.set('sender_name', senderName.trim())
    if (file) form.set('proof_file', file)
    try {
      const result = await confirmTransferAction(form)
      if (result.ok) onUpdated(result.order)
      else setError(result.message)
    } catch {
      setError('Connection lost. Check your internet and send again.')
    }
    setBusy(false)
  }

  return (
    <div className="space-y-5">
      <dl className="divide-y divide-line-soft rounded-2xl border border-line bg-subtle">
        <Row label="Bank" value={bank.name} />
        <Row label="Account number" value={bank.accountNumber} mono copy />
        <Row label="Account holder" value={bank.holder} />
        <Row label="Transfer amount" value={rupiah(order.total)} copyValue={String(order.total)} strong />
      </dl>

      <Notice tone="info" title="Transfer exactly that amount">
        {order.unique_code > 0
          ? 'The amount already includes a unique code in the last three digits. The seller uses that code to identify your transfer, so do not round it.'
          : 'A different amount can delay your payment being identified.'}
      </Notice>

      {confirmation?.status === 'pending' ? (
        <Notice tone="success" title="Confirmation received, awaiting verification">
          The seller will check your transfer. This is a manual process and can take a few hours. This page updates automatically once
          the payment is verified; you will also get an email and a WhatsApp message.
        </Notice>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4 border-t border-line-soft pt-5">
          <div>
            <p className="font-semibold">Already transferred?</p>
            <p className="mt-0.5 text-sm text-fg-subtle">Let the seller know so your payment is verified quickly.</p>
          </div>

          {confirmation?.status === 'rejected' && (
            <Notice title="Previous confirmation rejected">{confirmation.rejection_reason || 'Check your transfer again, then send a new confirmation.'}</Notice>
          )}

          <Field
            label="Sending account holder name"
            autoComplete="name"
            maxLength={100}
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            disabled={busy}
          />

          <div>
            <label htmlFor="proof" className="mb-1.5 block text-sm font-medium text-fg">
              Proof of transfer <span className="font-normal text-fg-subtle">(optional)</span>
            </label>
            <input
              id="proof"
              type="file"
              accept={orderStatusConfig.proofTypes.join(',')}
              disabled={busy}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-fg-muted file:mr-3 file:h-11 file:cursor-pointer file:rounded-full file:border file:border-solid file:border-line-strong file:bg-surface file:px-4 file:text-sm file:font-semibold file:text-fg"
            />
            <p className={fileTooBig ? 'mt-1.5 text-sm text-danger' : 'mt-1.5 text-sm text-fg-subtle'}>
              {fileTooBig ? `File is too large. Maximum ${MAX_MB} MB.` : `JPG, PNG, WebP, or PDF. Maximum ${MAX_MB} MB.`}
            </p>
          </div>

          {error && <Notice>{error}</Notice>}

          <Button type="submit" size="lg" block disabled={busy || fileTooBig}>
            {busy ? 'Sending…' : "I've made the transfer"}
          </Button>
        </form>
      )}
    </div>
  )
}

function Row({ label, value, copy, copyValue, mono, strong }: { label: string; value: string; copy?: boolean; copyValue?: string; mono?: boolean; strong?: boolean }) {
  const toCopy = copyValue ?? (copy ? value : null)
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <dt className="text-xs text-fg-subtle">{label}</dt>
        <dd className={[mono ? 'font-mono tracking-wider' : '', strong ? 'text-xl font-bold tabular-nums text-accent' : 'font-semibold', 'break-all'].join(' ')}>{value}</dd>
      </div>
      {toCopy && <CopyButton value={toCopy} />}
    </div>
  )
}
