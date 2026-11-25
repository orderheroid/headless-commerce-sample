import 'server-only'

import { isIP } from 'node:net'

import { headers } from 'next/headers'

// Buyer IP and user agent for `tracking.client_ip` / `tracking.client_user_agent` in POST /orders.
// With a secret key every order comes from the store server's IP, so OrderHero needs the buyer IP for
// per-IP limits and for ad pixel matching.
//
// The IP comes only from headers set by the hosting platform: on Vercel, `x-real-ip` and `x-forwarded-for`
// are rewritten by the Vercel proxy. Local/private IPs (development) are not sent.

function isPublicIp(ip: string): boolean {
  const v = isIP(ip)
  if (v === 4) {
    const [a, b] = ip.split('.').map(Number)
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    )
  }
  if (v === 6) {
    const lower = ip.toLowerCase()
    return !(lower === '::1' || lower === '::' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80'))
  }
  return false
}

export async function buyerTracking(): Promise<{ client_ip?: string; client_user_agent?: string }> {
  const h = await headers()
  const candidate = (h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0] ?? '').trim()
  const ua = (h.get('user-agent') ?? '').trim().slice(0, 512)
  return {
    ...(isPublicIp(candidate) ? { client_ip: candidate } : {}),
    ...(ua ? { client_user_agent: ua } : {}),
  }
}
