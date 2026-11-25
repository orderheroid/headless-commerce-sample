// Buyer data validation. Used in the browser (inline field messages) and in the server action
// (checked again, because a server action can be called directly).

export type BuyerInput = { name: string; email: string; phone: string }
export type BuyerErrors = Partial<Record<keyof BuyerInput, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** 08xx / +62xx / 62xx / 8xx → 62xx. Null if it is not a plausible Indonesian mobile number. */
export function normalizePhone(value: string): string | null {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = '62' + digits.slice(1)
  else if (digits.startsWith('8')) digits = '62' + digits
  return /^628\d{7,12}$/.test(digits) ? digits : null
}

export function validateBuyer(b: BuyerInput): BuyerErrors {
  const errors: BuyerErrors = {}
  const name = b.name.trim()
  if (name.length < 2) errors.name = 'Enter your full name.'
  else if (name.length > 100) errors.name = 'Name is too long (maximum 100 characters).'

  const email = b.email.trim()
  if (!email) errors.email = 'Enter your email address.'
  else if (!EMAIL_RE.test(email) || email.length > 200) errors.email = 'The email format is not valid, for example: name@gmail.com.'

  if (!b.phone.trim()) errors.phone = 'Enter your WhatsApp number.'
  else if (!normalizePhone(b.phone)) errors.phone = 'The WhatsApp number is not valid, for example: 081234567890.'

  return errors
}

/** Buyer data cleaned up for sending to the API; null if invalid. */
export function cleanBuyer(b: BuyerInput): BuyerInput | null {
  if (Object.keys(validateBuyer(b)).length > 0) return null
  return { name: b.name.trim(), email: b.email.trim().toLowerCase(), phone: normalizePhone(b.phone)! }
}
