// Aturan status order (dipakai server dan browser).
// API meneruskan nilai status apa adanya, termasuk nilai lama, jadi daftarnya sengaja longgar.

/** `status` atau `payment_status` bernilai ini = order tertutup, polling berhenti. */
export const CLOSED_VALUES = ['cancelled', 'canceled', 'expired', 'failed', 'refunded', 'returned', 'deleted']

/** Order headless belum punya `expires_at`; cron menutupnya `created_at` + 24 jam. */
export const ORDER_LIFETIME_MS = 24 * 60 * 60_000

/**
 * Sejak 25 Nov 2026 OrderHero membatasi masa berlaku kode bayar sampai tenggat order, dan menolak kode baru
 * bila sisa waktunya kurang dari 5 menit (`409 ORDER_CLOSED`). Toko mengikuti batas yang sama.
 */
export const NO_NEW_CODE_BEFORE_CLOSE_MS = 5 * 60_000

export function isPaid(o: { payment_status: string }): boolean {
  return o.payment_status === 'paid'
}

export function isClosed(o: { status: string; payment_status: string }): boolean {
  return !isPaid(o) && (CLOSED_VALUES.includes(o.status) || CLOSED_VALUES.includes(o.payment_status))
}

function time(iso: string | null | undefined): number | null {
  if (!iso) return null
  const t = Date.parse(iso)
  return Number.isFinite(t) ? t : null
}

/** Batas tutup order: `expires_at` order bila ada, selain itu `created_at` + 24 jam. */
export function closesAt(order: { expires_at?: string | null; created_at?: string | null }): string | null {
  const explicit = time(order.expires_at)
  if (explicit !== null) return new Date(explicit).toISOString()
  const created = time(order.created_at)
  return created === null ? null : new Date(created + ORDER_LIFETIME_MS).toISOString()
}

/** Order sudah lewat batas tutup walau cron belum menulis status `cancelled`. */
export function isPastClosing(o: { closes_at: string | null }, now = Date.now()): boolean {
  const t = time(o.closes_at)
  return t !== null && t <= now
}

/** Masih boleh membuat kode bayar baru (belum masuk 5 menit terakhir sebelum order ditutup). */
export function canCreateNewCode(o: { closes_at: string | null }, now = Date.now()): boolean {
  const t = time(o.closes_at)
  return t === null || now < t - NO_NEW_CODE_BEFORE_CLOSE_MS
}

/** `payment.status` tetap `pending` sampai cron berjalan, jadi kedaluwarsa dihitung sendiri dari `expires_at`. */
export function isPaymentExpired(p: { status: string; expires_at: string | null }, now = Date.now()): boolean {
  if (p.status === 'expired') return true
  const t = time(p.expires_at)
  return t !== null && t <= now
}

/** Batas bayar yang ditampilkan: mana yang lebih dulu, kode kedaluwarsa atau order ditutup. */
export function payBefore(p: { expires_at: string | null } | null, o: { closes_at: string | null }): number | null {
  const a = time(p?.expires_at)
  const b = time(o.closes_at)
  if (a === null) return b
  if (b === null) return a
  return Math.min(a, b)
}
