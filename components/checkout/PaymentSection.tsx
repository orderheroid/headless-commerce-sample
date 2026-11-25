'use client'

import { Card, CardHeader, ChoiceList } from '@/components/ui'
import type { PaymentMethod } from '@/lib/types'

/** Metode bayar dari GET /checkout/payment-methods: `label` dan urutan apa adanya (aturan 3). */
export function PaymentSection({
  methods,
  value,
  onChange,
  disabled,
  step,
}: {
  methods: PaymentMethod[]
  value: string
  onChange: (code: string) => void
  disabled?: boolean
  step?: number
}) {
  return (
    <Card>
      <CardHeader step={step} title="Metode pembayaran" />
      <ChoiceList
        name="payment_method"
        label="Metode pembayaran"
        value={value}
        onChange={onChange}
        disabled={disabled}
        choices={methods.map((m) => ({ value: m.code, label: m.label, image: m.image }))}
      />
    </Card>
  )
}
