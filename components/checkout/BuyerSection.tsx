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
  /** Hanya galat field yang sudah disentuh/dikirim. */
  errors: BuyerErrors
  onBlur: (field: keyof BuyerInput) => void
  disabled?: boolean
  step?: number
}

export function BuyerSection({ value, onChange, errors, onBlur, disabled, step }: Props) {
  const set = (field: keyof BuyerInput) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [field]: e.target.value })
  return (
    <Card>
      <CardHeader step={step} title="Data pembeli" description="Produk dikirim ke email dan WhatsApp ini setelah pembayaran lunas." />
      <div className="grid gap-4">
        <Field
          id={BUYER_FIELD_IDS.name}
          label="Nama lengkap"
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
          label="Nomor WhatsApp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="081234567890"
          hint="Pastikan nomor aktif di WhatsApp."
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
