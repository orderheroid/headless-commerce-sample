'use client'

import { Card, CardHeader, Field } from '@/components/ui'
import type { BuyerErrors, BuyerInput } from '@/lib/validation'

export const BUYER_FIELD_IDS: Record<keyof BuyerInput, string> = {
  name: 'buyer-name',
  email: 'buyer-email',
  phone: 'buyer-phone',
}

type Props = {
  value: BuyerInput
  onChange: (value: BuyerInput) => void
  /** Only errors for fields already touched/submitted. */
  errors: BuyerErrors
  onBlur: (field: keyof BuyerInput) => void
  disabled?: boolean
  step?: number
}

export function BuyerSection({ value, onChange, errors, onBlur, disabled, step }: Props) {
  const set = (field: keyof BuyerInput) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [field]: e.target.value })
  return (
    <Card>
      <CardHeader step={step} title="Buyer details" description="Products are sent to this email and WhatsApp number once payment is complete." />
      <div className="grid gap-4">
        <Field
          id={BUYER_FIELD_IDS.name}
          label="Full name"
          autoComplete="name"
          maxLength={100}
          value={value.name}
          onChange={set('name')}
          onBlur={() => onBlur('name')}
          error={errors.name}
          disabled={disabled}
        />
        <Field
          id={BUYER_FIELD_IDS.email}
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={200}
          value={value.email}
          onChange={set('email')}
          onBlur={() => onBlur('email')}
          error={errors.email}
          disabled={disabled}
        />
        <Field
          id={BUYER_FIELD_IDS.phone}
          label="WhatsApp number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="081234567890"
          hint="Make sure this number is active on WhatsApp."
          value={value.phone}
          onChange={set('phone')}
          onBlur={() => onBlur('phone')}
          error={errors.phone}
          disabled={disabled}
        />
      </div>
    </Card>
  )
}
