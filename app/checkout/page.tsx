import type { Metadata } from 'next'

import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { Notice } from '@/components/ui'
import { getPaymentMethods, toFailure } from '@/lib/orderhero'
import type { PaymentMethods } from '@/lib/types'

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  let methods: PaymentMethods
  try {
    // The list and its order are used as returned by the API; cached for 60 seconds on the server.
    methods = await getPaymentMethods()
  } catch (err) {
    return <Notice title="Checkout could not be opened">{toFailure(err).message}</Notice>
  }

  return (
    <>
      <h1 className="mb-5 font-display text-3xl leading-none sm:text-4xl">Checkout</h1>
      {methods.methods.length === 0 ? (
        <Notice>No payment methods are active yet. Please contact the seller.</Notice>
      ) : (
        <CheckoutForm methods={methods.methods} defaultMethod={methods.default_method} />
      )}
    </>
  )
}
