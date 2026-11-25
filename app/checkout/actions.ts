'use server'

import { checkoutConfig } from '@/config/site'
import { buyerTracking } from '@/lib/client-info'
import { buyerMessage } from '@/lib/errors'
import { isUuid } from '@/lib/format'
import { OrderHeroError, createOrder, getOrder, getProduct, getQuote, toFailure } from '@/lib/orderhero'
import { siteOrigin } from '@/lib/site-url'
import type { CartLine, CreateOrderResult, Failure, OrderResult, QuoteResult } from '@/lib/types'
import { cleanBuyer, validateBuyer } from '@/lib/validation'

// Server action dipanggil dari browser, jadi semua input diperiksa ulang di sini.
// Tidak ada field harga yang diterima maupun dikirim ke API.

const fail = (code: string, message = buyerMessage(code)): Failure => ({ ok: false, code, message })

// ---------------------------------------------------------------- pembersih input

function cleanItems(input: unknown): CartLine[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 50) return null
  const items: CartLine[] = []
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') return null
    const { product_id, variant_id, quantity } = raw as Record<string, unknown>
    if (typeof product_id !== 'string' || product_id.length === 0 || product_id.length > 200) return null
    if (variant_id !== undefined && (typeof variant_id !== 'string' || variant_id.length > 200)) return null
    if (!Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > 100) return null
    items.push({ product_id, quantity: quantity as number, ...(variant_id ? { variant_id } : {}) })
  }
  return items
}

function cleanCode(value: unknown, max = 64): string | undefined {
  if (typeof value !== 'string') return undefined
  const v = value.trim()
  return v && v.length <= max ? v : undefined
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')

// ---------------------------------------------------------------- quote

export async function quoteAction(input: { items: unknown; paymentMethod?: unknown; couponCode?: unknown }): Promise<QuoteResult> {
  const items = cleanItems(input?.items)
  if (!items) return fail('ITEMS_REQUIRED')
  try {
    const { client_ip } = await buyerTracking()
    const quote = await getQuote({
      items,
      payment_method: cleanCode(input.paymentMethod),
      coupon_code: cleanCode(input.couponCode),
      // Batas 60 quote/menit per IP pembeli, supaya satu pengunjung tidak menghabiskan kuota quote toko.
      ...(client_ip ? { tracking: { client_ip } } : {}),
    })
    return { ok: true, quote }
  } catch (err) {
    return toFailure(err)
  }
}

// ---------------------------------------------------------------- order

/** True bila ada produk di keranjang yang stoknya dihitung (stok di-reserve saat order dibuat). */
async function holdsStock(items: CartLine[]): Promise<boolean> {
  const products = await Promise.all(items.map((i) => getProduct(i.product_id).catch(() => null)))
  return products.some((p) => p?.track_inventory === true)
}

/** Pesan 429 untuk pembuatan order: ada batas per email/telepon dan per IP pembeli. */
function orderRateLimited(err: OrderHeroError): Failure {
  const minutes = err.retryAfter ? Math.max(1, Math.ceil(err.retryAfter / 60)) : null
  return {
    ...fail('RATE_LIMITED', `Terlalu banyak percobaan pesanan dari kontak atau jaringan ini. Coba lagi ${minutes ? `dalam ${minutes} menit` : 'beberapa saat lagi'}.`),
    ...(err.retryAfter ? { retryAfter: err.retryAfter } : {}),
  }
}

/** Order yang mungkin sudah ada untuk external_reference ini; null bila memang belum ada. */
async function findExisting(reference: string): Promise<OrderResult | null> {
  try {
    return await getOrder(reference)
  } catch (err) {
    if (err instanceof OrderHeroError && err.status === 404) return null
    throw err
  }
}

export async function createOrderAction(input: {
  items: unknown
  name: unknown
  email: unknown
  phone: unknown
  paymentMethod: unknown
  couponCode?: unknown
  idempotencyKey: unknown
  externalReference: unknown
}): Promise<CreateOrderResult> {
  const items = cleanItems(input?.items)
  if (!items) return fail('ITEMS_REQUIRED')
  if (!isUuid(input.idempotencyKey) || !isUuid(input.externalReference)) return fail('INTERNAL_ERROR')
  const reference = input.externalReference

  const raw = { name: str(input.name), email: str(input.email), phone: str(input.phone) }
  const customer = cleanBuyer(raw)
  if (!customer) {
    const [, message] = Object.entries(validateBuyer(raw))[0] ?? []
    return fail('INVALID_CUSTOMER', message ?? 'Periksa lagi data pembeli.')
  }
  const paymentMethod = cleanCode(input.paymentMethod)
  if (!paymentMethod) return fail('PAYMENT_METHOD_REQUIRED')

  let statusUrl: string
  let stockHold: boolean
  try {
    // Origin dari env/Vercel, bukan dari header permintaan (lihat lib/site-url.ts).
    statusUrl = `${await siteOrigin()}/pesanan/${reference}`
    stockHold = await holdsStock(items) // katalog di-cache 300 detik
  } catch (err) {
    return toFailure(err) // salah konfigurasi: tidak ada order yang dibuat
  }

  try {
    await createOrder(
      {
        items,
        customer,
        payment_method: paymentMethod,
        ...(cleanCode(input.couponCode) ? { coupon_code: cleanCode(input.couponCode) } : {}),
        external_reference: reference,
        // Cadangan bila pembeli membayar lewat halaman OrderHero: kembali ke halaman status toko.
        return_url: statusUrl,
        // Tautan bayar di WA/email "pesanan diterima" dan pengingat bayar mengarah ke halaman status toko.
        status_url: statusUrl,
        // IP pembeli: dasar batas per IP OrderHero untuk kunci secret, dan pencocokan pixel iklan.
        tracking: await buyerTracking(),
        // Produk berstok: order belum dibayar ditutup lebih cepat dan stoknya kembali.
        // Produk tanpa stok: bawaan 24 jam, supaya pembeli VA/gerai punya cukup waktu.
        ...(stockHold ? { expires_in_minutes: checkoutConfig.stockHoldMinutes } : {}),
      },
      input.idempotencyKey,
    )
    return { ok: true, reference }
  } catch (err) {
    if (!(err instanceof OrderHeroError)) return toFailure(err)

    // Order mungkin sudah dibuat: baca yang ada lewat external_reference, jangan buat baru.
    if (['DUPLICATE_REFERENCE', 'IDEMPOTENCY_OUTCOME_UNKNOWN', 'IDEMPOTENCY_KEY_REUSED'].includes(err.code)) {
      let existing: OrderResult | null
      try {
        existing = await findExisting(reference)
      } catch (readErr) {
        return toFailure(readErr)
      }
      if (existing) return { ok: true, reference }

      if (err.code === 'DUPLICATE_REFERENCE') {
        // Referensi terpakai tetapi ordernya tidak terbaca: jangan dicoba lagi dengan referensi ini.
        return fail(err.code, 'Pesananmu sedang diproses. Muat ulang halaman ini beberapa saat lagi.')
      }
      // Order dengan referensi ini memang belum ada. external_reference tetap sama dan dijaga unik
      // oleh OrderHero, jadi mengganti Idempotency-Key saja tidak bisa menghasilkan order kedua.
      return { ...toFailure(err), rotateIdempotencyKey: true }
    }
    if (err.code === 'RATE_LIMITED') return orderRateLimited(err)
    return toFailure(err)
  }
}
