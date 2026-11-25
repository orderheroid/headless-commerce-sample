import 'server-only'

import { closesAt, isClosed, isPaid } from './order-status'
import type { OrderResult, PublicOrderStatus } from './types'

/**
 * Satu-satunya pintu data order ke browser. Allowlist eksplisit: field baru dari API
 * (termasuk `customer`) tidak pernah ikut terkirim.
 */
export function toPublicStatus({ order, payment, payment_page_url, transfer_confirmation }: OrderResult): PublicOrderStatus {
  const finished = isPaid(order) || isClosed(order)
  const hasCode = !!(payment?.qris_payload || payment?.virtual_account)
  return {
    order_number: order.order_number,
    status: order.status,
    payment_status: order.payment_status,
    payment_method: order.payment_method ?? null,
    items: order.items.map((i) => ({
      name: i.product_name,
      variant: i.variant_name ?? null,
      quantity: i.quantity,
      subtotal: i.subtotal,
    })),
    total: order.amounts.total,
    // Instruksi bayar disembunyikan setelah order lunas atau ditutup.
    payment:
      finished || !payment
        ? null
        : {
            method_code: payment.method_code,
            status: payment.status,
            amount: payment.amount,
            qris_payload: payment.qris_payload ?? null,
            virtual_account: payment.virtual_account ?? null,
            // `payment_url` Duitku untuk QRIS/VA adalah halaman Duitku: hanya dipakai bila tidak ada kode.
            payment_url: hasCode ? null : (payment.payment_url ?? null),
            expires_at: payment.expires_at ?? null,
          },
    payment_page_url: finished ? null : payment_page_url,
    closes_at: closesAt(order),
    paid_at: order.paid_at ?? null,
    digital_delivered: order.digital_delivered === true,
    delivery_status: order.delivery?.status ?? null,
    unique_code: order.amounts.unique_code ?? 0,
    // Hanya status dan alasan penolakan; nama pengirim dan bukti transfer tidak diteruskan.
    transfer: transfer_confirmation ? { status: transfer_confirmation.status, rejection_reason: transfer_confirmation.rejection_reason ?? null } : null,
  }
}
