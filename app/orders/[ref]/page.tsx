import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { OrderStatus } from '@/components/order/OrderStatus'
import { isUuid } from '@/lib/format'
import { getPaymentMethods } from '@/lib/orderhero'
import type { PaymentMethod } from '@/lib/types'

export const metadata: Metadata = { title: 'Order status', robots: { index: false } }

export default async function OrderPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  if (!isUuid(ref)) notFound()

  // Channel name and logo (not present in `payment`), plus the options for changing method. Cached for 60 seconds.
  let methods: PaymentMethod[] = []
  try {
    methods = (await getPaymentMethods()).methods
  } catch {
    // Without the method list, the payment code still shows; only the channel name and the change-method option are missing.
  }

  return (
    <>
      <h1 className="sr-only">Order status</h1>
      <OrderStatus reference={ref} methods={methods.map((m) => ({
          code: m.code,
          label: m.label,
          image: m.image,
          category: m.category,
          // Manual transfer account: the store's payment information, not buyer data.
          bank: m.account_number ? { name: m.bank_name ?? m.label, accountNumber: m.account_number, holder: m.account_holder_name ?? '' } : null,
        }))} />
    </>
  )
}
