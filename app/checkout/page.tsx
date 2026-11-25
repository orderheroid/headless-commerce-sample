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
    // Daftar dan urutannya apa adanya dari API; di-cache 60 detik di server.
    methods = await getPaymentMethods()
  } catch (err) {
    return <Notice title="Checkout belum bisa dibuka">{toFailure(err).message}</Notice>
  }

  return (
    <>
      <h1 className="mb-5 font-display text-3xl leading-none sm:text-4xl">Checkout</h1>
      {methods.methods.length === 0 ? (
        <Notice>Belum ada metode pembayaran yang aktif. Silakan hubungi penjual.</Notice>
      ) : (
        <CheckoutForm methods={methods.methods} defaultMethod={methods.default_method} />
      )}
    </>
  )
}
