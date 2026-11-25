import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { OrderStatus } from '@/components/order/OrderStatus'
import { isUuid } from '@/lib/format'
import { getPaymentMethods } from '@/lib/orderhero'
import type { PaymentMethod } from '@/lib/types'

export const metadata: Metadata = { title: 'Status pesanan', robots: { index: false } }

export default async function OrderPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  if (!isUuid(ref)) notFound()

  // Nama dan logo kanal (tidak ada di `payment`), serta pilihan untuk ganti metode. Di-cache 60 detik.
  let methods: PaymentMethod[] = []
  try {
    methods = (await getPaymentMethods()).methods
  } catch {
    // Tanpa daftar metode, kode bayar tetap tampil; hanya nama kanal dan opsi ganti metode yang hilang.
  }

  return (
    <>
      <h1 className="sr-only">Status pesanan</h1>
      <OrderStatus reference={ref} methods={methods.map((m) => ({
          code: m.code,
          label: m.label,
          image: m.image,
          category: m.category,
          // Rekening transfer manual: informasi pembayaran toko, bukan data pembeli.
          bank: m.account_number ? { name: m.bank_name ?? m.label, accountNumber: m.account_number, holder: m.account_holder_name ?? '' } : null,
        }))} />
    </>
  )
}
