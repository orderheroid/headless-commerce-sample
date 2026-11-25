import { NextResponse } from 'next/server'

import { isUuid } from '@/lib/format'
import { toPublicStatus } from '@/lib/order-public'
import { OrderHeroError, getOrder, toFailure } from '@/lib/orderhero'

// Called by the /pesanan/[ref] page every few seconds. The response body comes only from toPublicStatus
// (order number, status, items, total, payment code, payment_page_url). Buyer data is never included.

const NO_STORE = { 'Cache-Control': 'no-store' }

// Concurrent requests for the same ref (several tabs, or the cache just expired) share a single
// API call, so the read quota of 120/minute per key is not used up by one order.
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
  // Only an external_reference created by this checkout (UUID), not an easily guessed order number.
  if (!isUuid(ref)) {
    return NextResponse.json({ ok: false, code: 'INVALID_REFERENCE', message: 'The order link is not valid.' }, { status: 400, headers: NO_STORE })
  }

  try {
    // Cached for 5 seconds on the server so many tabs/buyers do not use up the API read quota.
    // The cache is cleared immediately after the payment code is recreated (updateTag in the server action).
    const result = await readOrder(ref)
    return NextResponse.json({ ok: true, order: toPublicStatus(result) }, { headers: NO_STORE })
  } catch (err) {
    const failure = toFailure(err)
    const status = err instanceof OrderHeroError && err.status >= 400 ? err.status : 502
    const headers: Record<string, string> = { ...NO_STORE }
    if (failure.retryAfter) headers['Retry-After'] = String(failure.retryAfter)
    // Internal key/configuration codes are not passed to the browser as is.
    const safeStatus = status === 401 || status === 403 ? 503 : status
    return NextResponse.json(failure, { status: safeStatus, headers })
  }
}
