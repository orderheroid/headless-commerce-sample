import 'server-only'

import { isIP } from 'node:net'

import { headers } from 'next/headers'

// IP dan user agent pembeli untuk `tracking.client_ip` / `tracking.client_user_agent` di POST /orders.
// Kunci secret membuat semua order datang dari IP server toko, jadi OrderHero butuh IP pembeli untuk
// batas per IP dan untuk pencocokan pixel iklan.
//
// Sumber IP hanya header yang diisi platform hosting: di Vercel, `x-real-ip` dan `x-forwarded-for`
// ditulis ulang oleh proxy Vercel. IP lokal/privat (pengembangan) tidak dikirim.

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
