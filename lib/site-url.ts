import 'server-only'

import { headers } from 'next/headers'

import { OrderHeroError } from './orderhero'

// Store address for return_url and status_url. NEVER taken from the Host/X-Forwarded-Host header
// outside localhost: that header can be spoofed, and OrderHero uses status_url in official WA/email to
// the buyer. Spoofed host + a victim's email/number = a phishing link sent in the store's name.

const LOCAL_HOST = /^(localhost|127\.0\.0\.1)(:\d{1,5})?$/

function fromEnv(raw: string): string {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new OrderHeroError(500, 'CONFIG_MISSING', 'SITE_URL is not a valid URL')
  }
  const local = LOCAL_HOST.test(url.host)
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password) {
    throw new OrderHeroError(500, 'CONFIG_MISSING', 'SITE_URL must be https (http only for localhost) and without credentials')
  }
  return url.origin
}

/** Store origin, e.g. `https://store.com`. */
export async function siteOrigin(): Promise<string> {
  // 1. Set by the store owner (recommended for a custom domain).
  const configured = process.env.SITE_URL?.trim()
  if (configured) return fromEnv(configured)

  // 2. Vercel system variables (set by Vercel, not by the visitor).
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  // 3. Local development: the Host header is trusted only if it is localhost (X-Forwarded-Host is ignored).
  const host = (await headers()).get('host') ?? ''
  if (LOCAL_HOST.test(host)) return `http://${host}`
  throw new OrderHeroError(500, 'CONFIG_MISSING', 'SITE_URL is not set')
}
