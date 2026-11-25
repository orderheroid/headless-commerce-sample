import { site } from '@/config/site'

const idr = new Intl.NumberFormat(site.locale, {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

/** Only formats numbers from the API; no price calculation happens here. */
export function rupiah(amount: number): string {
  return idr.format(amount)
}

/** "25 Nov 2026, 20.45" in the store's time zone. */
export function dateTime(value: string | number | Date): string {
  return new Date(value).toLocaleString(site.locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: site.timeZone })
}

/** Time remaining, "1:05:09" or "05:09". */
export function remaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}

/** UUID v4 in the browser; getRandomValues fallback for browsers without crypto.randomUUID. */
export function newUuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
