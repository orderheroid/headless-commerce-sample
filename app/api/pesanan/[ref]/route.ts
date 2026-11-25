import { NextResponse } from 'next/server'

import { isUuid } from '@/lib/format'
import { toPublicStatus } from '@/lib/order-public'
import { OrderHeroError, getOrder, toFailure } from '@/lib/orderhero'

// Dipanggil halaman /pesanan/[ref] tiap beberapa detik. Isi respons hanya dari toPublicStatus
// (nomor order, status, item, total, kode bayar, payment_page_url). Data pembeli tidak pernah ikut.

const NO_STORE = { 'Cache-Control': 'no-store' }

// Permintaan bersamaan untuk ref yang sama (beberapa tab, atau cache baru saja kedaluwarsa) berbagi satu
// panggilan ke API, supaya kuota baca 120/menit per kunci tidak habis oleh satu pesanan.
const inFlight = new Map<string, ReturnType<typeof getOrder>>()

function readOrder(ref: string) {
  const existing = inFlight.get(ref)
  if (existing) return existing
  const pending = getOrder(ref, { revalidate: 5 }).finally(() => inFlight.delete(ref))
  inFlight.set(ref, pending)
  return pending
}

export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  // Hanya external_reference buatan checkout ini (UUID), bukan nomor order yang mudah ditebak.
  if (!isUuid(ref)) {
    return NextResponse.json({ ok: false, code: 'INVALID_REFERENCE', message: 'Tautan pesanan tidak valid.' }, { status: 400, headers: NO_STORE })
  }

  try {
    // Di-cache 5 detik di server supaya banyak tab/pembeli tidak menghabiskan kuota baca API.
    // Cache dibersihkan seketika setelah kode bayar dibuat ulang (updateTag di server action).
    const result = await readOrder(ref)
    return NextResponse.json({ ok: true, order: toPublicStatus(result) }, { headers: NO_STORE })
  } catch (err) {
    const failure = toFailure(err)
    const status = err instanceof OrderHeroError && err.status >= 400 ? err.status : 502
    const headers: Record<string, string> = { ...NO_STORE }
    if (failure.retryAfter) headers['Retry-After'] = String(failure.retryAfter)
    // Kode internal kunci/konfigurasi tidak diteruskan apa adanya ke browser.
    const safeStatus = status === 401 || status === 403 ? 503 : status
    return NextResponse.json(failure, { status: safeStatus, headers })
  }
}
