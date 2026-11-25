'use client'

import { useState } from 'react'

import { confirmTransferAction } from '@/app/pesanan/[ref]/actions'
import { orderStatusConfig } from '@/config/site'
import { Button, CopyButton, Field, Notice } from '@/components/ui'
import { rupiah } from '@/lib/format'
import type { PublicOrderStatus } from '@/lib/types'

import type { MethodOption } from './MethodSwitcher'

type Props = {
  reference: string
  order: PublicOrderStatus
  /** Rekening tujuan dari GET /checkout/payment-methods (kategori MANUAL_TRANSFER). */
  bank: NonNullable<MethodOption['bank']>
  onUpdated: (order: PublicOrderStatus) => void
}

const MAX_MB = Math.floor(orderStatusConfig.proofMaxBytes / (1024 * 1024))

/**
 * Transfer bank manual: rekening tujuan, jumlah persis (termasuk kode unik), lalu "Saya sudah transfer".
 * Order baru lunas setelah merchant memverifikasinya di dashboard, yang bisa memakan waktu berjam-jam.
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
      setError('Isi nama pemilik rekening pengirim.')
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
      setError('Koneksi terputus. Periksa internetmu lalu kirim lagi.')
    }
    setBusy(false)
  }

  return (
    <div className="space-y-5">
      <dl className="divide-y divide-line-soft rounded-2xl border border-line bg-subtle">
        <Row label="Bank" value={bank.name} />
        <Row label="Nomor rekening" value={bank.accountNumber} mono copy />
        <Row label="Atas nama" value={bank.holder} />
        <Row label="Jumlah transfer" value={rupiah(order.total)} copyValue={String(order.total)} strong />
      </dl>

      <Notice tone="info" title="Transfer persis sejumlah itu">
        {order.unique_code > 0
          ? 'Jumlahnya sudah termasuk kode unik di tiga digit terakhir. Kode itulah yang dipakai penjual untuk mengenali transfermu, jadi jangan dibulatkan.'
          : 'Jumlah yang berbeda bisa membuat pembayaranmu lama dikenali.'}
      </Notice>

      {confirmation?.status === 'pending' ? (
        <Notice tone="success" title="Konfirmasi diterima, menunggu verifikasi">
          Penjual akan memeriksa transfermu. Proses ini manual dan bisa memakan waktu beberapa jam. Halaman ini berubah otomatis setelah
          pembayaran diverifikasi; kamu juga akan menerima email dan WhatsApp.
        </Notice>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4 border-t border-line-soft pt-5">
          <div>
            <p className="font-semibold">Sudah transfer?</p>
            <p className="mt-0.5 text-sm text-fg-subtle">Kabari penjual supaya pembayaranmu cepat diverifikasi.</p>
          </div>

          {confirmation?.status === 'rejected' && (
            <Notice title="Konfirmasi sebelumnya ditolak">{confirmation.rejection_reason || 'Periksa lagi transfermu, lalu kirim konfirmasi baru.'}</Notice>
          )}

          <Field
            label="Nama pemilik rekening pengirim"
            autoComplete="name"
            maxLength={100}
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            disabled={busy}
          />

          <div>
            <label htmlFor="proof" className="mb-1.5 block text-sm font-medium text-fg">
              Bukti transfer <span className="font-normal text-fg-subtle">(opsional)</span>
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
              {fileTooBig ? `Berkas terlalu besar. Maksimal ${MAX_MB} MB.` : `JPG, PNG, WebP, atau PDF. Maksimal ${MAX_MB} MB.`}
            </p>
          </div>

          {error && <Notice>{error}</Notice>}

          <Button type="submit" size="lg" block disabled={busy || fileTooBig}>
            {busy ? 'Mengirim…' : 'Saya sudah transfer'}
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
