import { CopyButton } from '@/components/ui'

/** VA number or retail outlet payment code (both in `payment.virtual_account`). */
export function PaymentCode({ code, kind, methodLabel }: { code: string; kind: 'va' | 'retail'; methodLabel: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-subtle p-4">
        <p className="text-sm text-fg-subtle">{kind === 'retail' ? 'Payment code' : 'Virtual account number'}</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <p className="break-all font-mono text-2xl font-bold tracking-wider text-fg">{code}</p>
          <CopyButton value={code} />
        </div>
      </div>
      <p className="text-sm text-fg-muted">
        {kind === 'retail'
          ? `Show this code to the cashier at ${methodLabel} and pay the amount shown above.`
          : `Transfer the amount shown above to this number via ${methodLabel} mobile banking, internet banking, or ATM.`}
      </p>
    </div>
  )
}
