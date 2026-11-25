import 'server-only'

import { headers } from 'next/headers'

import { OrderHeroError } from './orderhero'

// Alamat toko untuk return_url dan status_url. TIDAK PERNAH diambil dari header Host/X-Forwarded-Host
// di luar localhost: header itu bisa dipalsukan, dan status_url dipakai OrderHero di WA/email resmi ke
// pembeli. Host palsu + email/nomor korban = tautan phishing yang dikirim atas nama toko.

const LOCAL_HOST = /^(localhost|127\.0\.0\.1)(:\d{1,5})?$/

function fromEnv(raw: string): string {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new OrderHeroError(500, 'CONFIG_MISSING', 'SITE_URL bukan URL yang valid')
  }
  const local = LOCAL_HOST.test(url.host)
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password) {
    throw new OrderHeroError(500, 'CONFIG_MISSING', 'SITE_URL harus https (http hanya untuk localhost) dan tanpa kredensial')
  }
  return url.origin
}

/** Origin toko, mis. `https://toko.com`. */
export async function siteOrigin(): Promise<string> {
  // 1. Ditentukan pemilik toko (disarankan untuk domain sendiri).
  const configured = process.env.SITE_URL?.trim()
  if (configured) return fromEnv(configured)

  // 2. Variabel sistem Vercel (diisi Vercel, bukan oleh pengunjung).
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  // 3. Pengembangan lokal: header Host hanya dipercaya bila localhost (X-Forwarded-Host diabaikan).
  const host = (await headers()).get('host') ?? ''
  if (LOCAL_HOST.test(host)) return `http://${host}`
  throw new OrderHeroError(500, 'CONFIG_MISSING', 'SITE_URL belum diisi')
}
