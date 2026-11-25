// Validasi data pembeli. Dipakai di browser (pesan langsung di field) dan di server action
// (pemeriksaan ulang, karena server action bisa dipanggil langsung).

export type BuyerInput = { name: string; email: string; phone: string }
export type BuyerErrors = Partial<Record<keyof BuyerInput, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** 08xx / +62xx / 62xx / 8xx → 62xx. Null bila bukan nomor HP Indonesia yang masuk akal. */
export function normalizePhone(value: string): string | null {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = '62' + digits.slice(1)
  else if (digits.startsWith('8')) digits = '62' + digits
  return /^628\d{7,12}$/.test(digits) ? digits : null
}

export function validateBuyer(b: BuyerInput): BuyerErrors {
  const errors: BuyerErrors = {}
  const name = b.name.trim()
  if (name.length < 2) errors.name = 'Isi nama lengkapmu.'
  else if (name.length > 100) errors.name = 'Nama terlalu panjang (maksimal 100 karakter).'

  const email = b.email.trim()
  if (!email) errors.email = 'Isi alamat email.'
  else if (!EMAIL_RE.test(email) || email.length > 200) errors.email = 'Format email belum benar, contoh: nama@gmail.com.'

  if (!b.phone.trim()) errors.phone = 'Isi nomor WhatsApp.'
  else if (!normalizePhone(b.phone)) errors.phone = 'Nomor WhatsApp belum benar, contoh: 081234567890.'

  return errors
}

/** Data pembeli yang sudah dirapikan untuk dikirim ke API; null bila tidak valid. */
export function cleanBuyer(b: BuyerInput): BuyerInput | null {
  if (Object.keys(validateBuyer(b)).length > 0) return null
  return { name: b.name.trim(), email: b.email.trim().toLowerCase(), phone: normalizePhone(b.phone)! }
}
