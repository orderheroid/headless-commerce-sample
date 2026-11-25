'use client'

import { Button, ButtonLink, Card, Icon, Notice } from '@/components/ui'
import { dateTime, remaining, rupiah } from '@/lib/format'
import { useNow } from '@/lib/hooks'
import { canCreateNewCode, isPaymentExpired, payBefore } from '@/lib/order-status'
import type { PublicOrderStatus } from '@/lib/types'

import { ManualTransfer } from './ManualTransfer'
import { MethodSwitcher, type MethodOption } from './MethodSwitcher'
import { PaymentCode } from './PaymentCode'
import { QrisCode } from './QrisCode'
import { usePaymentChange } from './usePaymentChange'

type Props = {
  reference: string
  order: PublicOrderStatus
  methods: MethodOption[]
  onUpdated: (order: PublicOrderStatus) => void
}

/**
 * Instruksi bayar di halaman toko: QR (QRIS), nomor VA, atau kode gerai, plus hitung mundur dan
 * ganti metode. Tautan ke halaman bayar OrderHero tetap ada sebagai cadangan.
 */
export function PaymentPanel({ reference, order, methods, onUpdated }: Props) {
  const now = useNow(1000)
  const { change, busy, error } = usePaymentChange(reference, onUpdated)

  const payment = order.payment
  const currentCode = payment?.method_code ?? order.payment_method
  const method = methods.find((m) => m.code === currentCode) ?? null
  const methodLabel = method?.label ?? currentCode ?? 'pembayaran'

  // Transfer manual tidak punya kode bayar (`payment` null): yang tampil rekening tujuan.
  const manualBank = method?.category === 'MANUAL_TRANSFER' ? (method.bank ?? null) : null

  const expired = payment ? isPaymentExpired(payment, now) : false
  const deadline = payBefore(payment, order)
  const newCodeAllowed = canCreateNewCode(order, now)

  return (
    <Card className="space-y-5">
      {/* Metode dan jumlah: total order dari API, sudah termasuk perubahan bila metode diganti. */}
      <div className="flex items-center gap-3">
        {/* Logo kanal dibuat untuk latar terang: tetap di kotak putih pada mode gelap. */}
        <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-xl border border-line bg-white">
          {method?.image ? (
            <img src={method.image} alt="" className="max-h-7 max-w-11 object-contain" />
          ) : (
            <Icon name="receipt" className="h-5 w-5 text-fg-faint" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-fg-subtle">Bayar dengan</p>
          <p className="truncate font-semibold">{methodLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-fg-subtle">Jumlah</p>
          <p className="text-xl font-bold tabular-nums text-accent">{rupiah(order.total)}</p>
        </div>
      </div>

      {deadline && !expired && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
          <span className="flex items-center gap-2">
            <Icon name="clock" className="h-5 w-5" />
            Bayar sebelum {dateTime(deadline)}
          </span>
          <span className="font-mono font-semibold tabular-nums">{remaining(deadline - now)}</span>
        </div>
      )}

      {manualBank ? (
        <ManualTransfer reference={reference} order={order} bank={manualBank} onUpdated={onUpdated} />
      ) : (
      <PaymentBody
        payment={payment}
        expired={expired}
        newCodeAllowed={newCodeAllowed}
        methodLabel={methodLabel}
        category={method?.category ?? null}
        closesAt={order.closes_at}
        busy={busy}
        onRegenerate={() => change(currentCode ?? '')}
        orderNumber={order.order_number}
      />
      )}

      {error && <Notice>{error}</Notice>}

      {methods.length > 1 && newCodeAllowed && (
        <MethodSwitcher methods={methods} current={currentCode} allowSame={!payment || expired} busy={busy} onConfirm={change} />
      )}

      {order.payment_page_url && (
        <p className="border-t border-line-soft pt-4 text-center text-sm text-fg-subtle">
          Ada kendala?{' '}
          <a href={order.payment_page_url} className="font-medium text-accent underline underline-offset-2">
            Bayar lewat halaman pembayaran OrderHero
          </a>
        </p>
      )}
    </Card>
  )
}

type BodyProps = {
  payment: PublicOrderStatus['payment']
  expired: boolean
  newCodeAllowed: boolean
  methodLabel: string
  category: string | null
  closesAt: string | null
  busy: boolean
  onRegenerate: () => void
  orderNumber: string | null
}

/** Isi utama panel sesuai keadaan kode bayar. */
function PaymentBody({ payment, expired, newCodeAllowed, methodLabel, category, closesAt, busy, onRegenerate, orderNumber }: BodyProps) {
  const tooLate = (
    <Notice tone="neutral" title="Kode baru tidak bisa dibuat">
      Pesanan ini {closesAt ? `ditutup pada ${dateTime(closesAt)}` : 'sebentar lagi ditutup'}. Silakan buat pesanan baru bila masih ingin membeli.
    </Notice>
  )

  if (!payment) {
    return newCodeAllowed ? (
      <Notice tone="info">Kode pembayaran belum tersedia. Pilih metode di bawah untuk membuat kode, atau gunakan halaman pembayaran OrderHero.</Notice>
    ) : (
      tooLate
    )
  }

  if (expired) {
    return (
      <div className="space-y-3">
        <Notice title="Kode pembayaran kedaluwarsa">Buat kode baru untuk melanjutkan pembayaran.</Notice>
        {newCodeAllowed ? (
          <Button size="lg" block disabled={busy} onClick={onRegenerate}>
            <Icon name="refresh" className="h-5 w-5" />
            {busy ? 'Membuat kode…' : 'Buat kode baru'}
          </Button>
        ) : (
          tooLate
        )}
      </div>
    )
  }

  if (payment.qris_payload) return <QrisCode payload={payment.qris_payload} fileName={`qris-${orderNumber ?? 'pesanan'}.png`} />
  if (payment.virtual_account) {
    return <PaymentCode code={payment.virtual_account} kind={category === 'RETAIL' ? 'retail' : 'va'} methodLabel={methodLabel} />
  }
  if (payment.payment_url) {
    return (
      <ButtonLink href={payment.payment_url} size="lg" block>
        Lanjutkan ke {methodLabel}
      </ButtonLink>
    )
  }
  return <Notice tone="info">Kode pembayaran belum bisa ditampilkan di sini. Gunakan halaman pembayaran OrderHero di bawah.</Notice>
}
