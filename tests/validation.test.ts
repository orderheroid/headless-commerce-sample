import { describe, expect, it } from 'vitest'

import { cleanBuyer, normalizePhone, validateBuyer } from '@/lib/validation'

describe('normalizePhone', () => {
  it('converts various Indonesian number formats to 62…', () => {
    expect(normalizePhone('0812-3456-7890')).toBe('6281234567890')
    expect(normalizePhone('+62 812 3456 7890')).toBe('6281234567890')
    expect(normalizePhone('81234567890')).toBe('6281234567890')
  })
  it('rejects implausible numbers', () => {
    expect(normalizePhone('12')).toBeNull()
    expect(normalizePhone('021555123')).toBeNull()
    expect(normalizePhone('')).toBeNull()
  })
})

describe('validateBuyer', () => {
  const valid = { name: 'Jane Doe', email: 'jane@mail.com', phone: '081234567890' }
  it('passes for valid data', () => expect(validateBuyer(valid)).toEqual({}))
  it('flags each invalid field', () => {
    expect(Object.keys(validateBuyer({ name: ' ', email: 'x', phone: '1' }))).toEqual(['name', 'email', 'phone'])
  })
  it('cleanBuyer tidies up email and phone', () => {
    expect(cleanBuyer({ ...valid, email: ' Jane@Mail.com ' })).toEqual({ name: 'Jane Doe', email: 'jane@mail.com', phone: '6281234567890' })
    expect(cleanBuyer({ ...valid, email: 'invalid' })).toBeNull()
  })
})
