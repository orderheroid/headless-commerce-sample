import 'server-only'

import { cache } from 'react'

import { site } from '@/config/site'

import { getStoreName } from './orderhero'

/** Store name from GET /meta (cached for 1 hour), with a fallback from config/site.ts. */
export const storeName = cache(async (): Promise<string> => {
  try {
    return (await getStoreName()) || site.fallbackName
  } catch {
    return site.fallbackName
  }
})
