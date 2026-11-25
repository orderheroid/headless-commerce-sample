'use client'

import { Card, CardHeader, ChoiceList } from '@/components/ui'
import type { PaymentMethod } from '@/lib/types'

/** Payment methods from GET /checkout/payment-methods: `label` and order as is. */
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
      <CardHeader step={step} title="Payment method" />
      <ChoiceList
        name="payment_method"
        label="Payment method"
        value={value}
        onChange={onChange}
        disabled={disabled}
        choices={methods.map((m) => ({ value: m.code, label: m.label, image: m.image }))}
      />
    </Card>
  )
}
