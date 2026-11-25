import { CopyButton } from '@/components/ui'

/** Nomor VA atau kode bayar gerai (keduanya di `payment.virtual_account`). */
export function PaymentCode({ code, kind, methodLabel }: { code: string; kind: 'va' | 'retail'; methodLabel: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-subtle p-4">
        <p className="text-sm text-fg-subtle">{kind === 'retail' ? 'Kode pembayaran' : 'Nomor Virtual Account'}</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <p className="break-all font-mono text-2xl font-bold tracking-wider text-fg">{code}</p>
          <CopyButton value={code} />
        </div>
      </div>
      <p className="text-sm text-fg-muted">
        {kind === 'retail'
          ? `Tunjukkan kode ini ke kasir ${methodLabel} dan bayar sesuai jumlah di atas.`
          : `Transfer ke nomor ini lewat m-banking, internet banking, atau ATM ${methodLabel}, sesuai jumlah di atas.`}
      </p>
    </div>
  )
}
