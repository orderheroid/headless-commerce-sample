import 'server-only'

import { cache } from 'react'

import { site } from '@/config/site'

import { getStoreName } from './orderhero'

/** Nama toko dari GET /meta (di-cache 1 jam), dengan cadangan dari config/site.ts. */
export const storeName = cache(async (): Promise<string> => {
  try {
    return (await getStoreName()) || site.fallbackName
  } catch {
    return site.fallbackName
  }
})
