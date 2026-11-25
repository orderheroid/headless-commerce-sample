import 'server-only'

import { closesAt, isClosed, isPaid } from './order-status'
import type { OrderResult, PublicOrderStatus } from './types'

/**
 * The only gateway for order data to the browser. Explicit allowlist: new fields from the API
 * (including `customer`) are never sent along.
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
    // Payment instructions are hidden once the order is paid or closed.
    payment:
      finished || !payment
        ? null
        : {
            method_code: payment.method_code,
            status: payment.status,
            amount: payment.amount,
            qris_payload: payment.qris_payload ?? null,
            virtual_account: payment.virtual_account ?? null,
            // Duitku's `payment_url` for QRIS/VA is a Duitku page: only used when there is no code.
            payment_url: hasCode ? null : (payment.payment_url ?? null),
            expires_at: payment.expires_at ?? null,
          },
    payment_page_url: finished ? null : payment_page_url,
    closes_at: closesAt(order),
    paid_at: order.paid_at ?? null,
    digital_delivered: order.digital_delivered === true,
    delivery_status: order.delivery?.status ?? null,
    unique_code: order.amounts.unique_code ?? 0,
    // Only the status and rejection reason; the sender name and proof of transfer are not passed on.
    transfer: transfer_confirmation ? { status: transfer_confirmation.status, rejection_reason: transfer_confirmation.rejection_reason ?? null } : null,
  }
}
