'use server'

import { randomUUID } from 'node:crypto'

import { updateTag } from 'next/cache'

import { orderStatusConfig } from '@/config/site'
import { buyerMessage } from '@/lib/errors'
import { isUuid } from '@/lib/format'
import { toPublicStatus } from '@/lib/order-public'
import { canCreateNewCode, isClosed, isPaid, isPastClosing } from '@/lib/order-status'
import { OrderHeroError, confirmTransfer, createPayment, getOrder, orderCacheTag, toFailure } from '@/lib/orderhero'
import type { ChangePaymentResult, ConfirmTransferResult } from '@/lib/types'

/** Hasil tidak diketahui: kode mungkin sudah terbuat di gateway. */
function outcomeUnknown(err: unknown): boolean {
  return err instanceof OrderHeroError && (err.code === 'NETWORK_ERROR' || err.status >= 500)
}

/**
 * Buat kode bayar baru untuk order ini: setelah kode lama kedaluwarsa, atau saat pembeli ganti metode.
 * Memakai kuota tulis dan (Duitku) dibatasi 6 kali per 24 jam per order.
 *
 * `attemptKey` dibuat browser satu per klik, dan dikirim ulang apa adanya bila klik sebelumnya dengan
 * metode yang sama putus di tengah jalan. Dipakai sebagai Idempotency-Key: retry tidak membuat kode kedua.
 */
export async function changePaymentAction(input: {
  reference: unknown
  paymentMethod: unknown
  attemptKey: unknown
}): Promise<ChangePaymentResult> {
  if (!isUuid(input?.reference)) return { ok: false, code: 'INVALID_REFERENCE', message: buyerMessage('INVALID_REFERENCE') }
  const ref = input.reference
  const method = typeof input.paymentMethod === 'string' ? input.paymentMethod.trim() : ''
  if (!method || method.length > 64) return { ok: false, code: 'PAYMENT_METHOD_REQUIRED', message: buyerMessage('PAYMENT_METHOD_REQUIRED') }
  if (!isUuid(input.attemptKey)) return { ok: false, code: 'INTERNAL_ERROR', message: buyerMessage('INTERNAL_ERROR') }
  const idempotencyKey = input.attemptKey

  try {
    // Periksa status dulu supaya pembeli mendapat pesan yang jelas (lunas, tertutup, terlalu dekat tenggat).
    // OrderHero juga menolak sendiri (409 ORDER_CLOSED) bila sisa waktu < 5 menit.
    const current = toPublicStatus(await getOrder(ref))
    if (isPaid(current)) return { ok: false, code: 'ALREADY_PAID', message: buyerMessage('ALREADY_PAID') }
    if (isClosed(current) || isPastClosing(current) || !canCreateNewCode(current)) {
      return { ok: false, code: 'ORDER_CLOSED', message: buyerMessage('ORDER_CLOSED') }
    }

    let result
    try {
      result = await createPayment(ref, method, { idempotencyKey })
    } catch (err) {
      if (err instanceof OrderHeroError && err.code === 'IDEMPOTENCY_OUTCOME_UNKNOWN') {
        // Kunci ini terkunci tanpa hasil: minta kode yang masih berlaku (metode & nominal sama) dengan kunci baru.
        result = await createPayment(ref, method, { idempotencyKey: randomUUID(), reuseExisting: true })
      } else if (outcomeUnknown(err)) {
        // Satu kali ulang dengan kunci yang sama: bila kode sempat terbuat, respons pertama yang kembali.
        result = await createPayment(ref, method, { idempotencyKey })
      } else {
        throw err
      }
    }
    updateTag(orderCacheTag(ref)) // polling berikutnya langsung membaca kode baru
    return { ok: true, order: toPublicStatus(result) }
  } catch (err) {
    updateTag(orderCacheTag(ref)) // status bisa saja berubah (mis. ALREADY_PAID)
    return toFailure(err)
  }
}

/**
 * "Saya sudah transfer" untuk order transfer manual: nama pengirim + bukti opsional (FormData).
 * Berkas diteruskan langsung ke OrderHero; toko ini tidak menyimpannya.
 */
export async function confirmTransferAction(form: FormData): Promise<ConfirmTransferResult> {
  const ref = form.get('reference')
  if (!isUuid(ref)) return { ok: false, code: 'INVALID_REFERENCE', message: buyerMessage('INVALID_REFERENCE') }

  const senderName = String(form.get('sender_name') ?? '').trim()
  if (senderName.length < 2 || senderName.length > 100) {
    return { ok: false, code: 'SENDER_NAME_REQUIRED', message: buyerMessage('SENDER_NAME_REQUIRED') }
  }

  const proof = form.get('proof_file')
  const proofFile = proof instanceof File && proof.size > 0 ? proof : null
  if (proofFile) {
    if (proofFile.size > orderStatusConfig.proofMaxBytes) {
      return { ok: false, code: 'PROOF_FILE_TOO_LARGE', message: buyerMessage('PROOF_FILE_TOO_LARGE') }
    }
    // Pemeriksaan awal saja; OrderHero menilai jenis berkas dari isinya.
    if (!(orderStatusConfig.proofTypes as readonly string[]).includes(proofFile.type)) {
      return { ok: false, code: 'PROOF_FILE_INVALID', message: buyerMessage('PROOF_FILE_INVALID') }
    }
  }

  try {
    try {
      await confirmTransfer(ref, { senderName, proofFile })
    } catch (err) {
      // Konfirmasi sebelumnya masih menunggu: bukan kegagalan, tampilkan status terbarunya.
      if (!(err instanceof OrderHeroError && err.code === 'CONFIRMATION_PENDING')) throw err
    }
    updateTag(orderCacheTag(ref))
    return { ok: true, order: toPublicStatus(await getOrder(ref)) }
  } catch (err) {
    updateTag(orderCacheTag(ref))
    return toFailure(err)
  }
}
