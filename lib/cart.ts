'use client'

import { useSyncExternalStore } from 'react'

import { useMounted } from './hooks'
import type { CartLine } from './types'

// Keranjang di localStorage. Tidak menyimpan harga: semua angka di checkout berasal dari
// POST /checkout/quote. Nama dan gambar disimpan hanya untuk tampilan.

export type CartItem = {
  productId: string
  variantId: string | null
  quantity: number
  name: string
  variantName: string | null
  image: string | null
  slug: string
}

const STORAGE_KEY = 'toko:keranjang:v1'
const CHANGE_EVENT = 'toko:keranjang'
const MAX_QTY = 100
const EMPTY: CartItem[] = []

let cachedRaw: string | null = null
let cachedItems: CartItem[] = EMPTY

function parse(raw: string | null): CartItem[] {
  if (!raw) return EMPTY
  try {
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return EMPTY
    return data.filter(
      (i) => i && typeof i.productId === 'string' && Number.isInteger(i.quantity) && i.quantity >= 1 && i.quantity <= MAX_QTY,
    )
  } catch {
    return EMPTY
  }
}

function read(): CartItem[] {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    // localStorage diblokir (mode privat tertentu): keranjang dianggap kosong
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedItems = parse(raw)
  }
  return cachedItems
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onChange) // perubahan dari tab lain
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

function write(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // abaikan
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

const sameLine = (a: CartItem, productId: string, variantId: string | null) => a.productId === productId && a.variantId === variantId
const clampQty = (q: number) => Math.max(1, Math.min(MAX_QTY, Math.trunc(q) || 1))

// ---------------------------------------------------------------- aksi

export function addToCart(item: CartItem) {
  const items = read()
  const existing = items.find((i) => sameLine(i, item.productId, item.variantId))
  write(
    existing
      ? items.map((i) => (i === existing ? { ...i, quantity: clampQty(i.quantity + item.quantity) } : i))
      : [...items, { ...item, quantity: clampQty(item.quantity) }],
  )
}

export function setQuantity(productId: string, variantId: string | null, quantity: number) {
  write(read().map((i) => (sameLine(i, productId, variantId) ? { ...i, quantity: clampQty(quantity) } : i)))
}

export function removeFromCart(productId: string, variantId: string | null) {
  write(read().filter((i) => !sameLine(i, productId, variantId)))
}

export function clearCart() {
  write([])
}

// ---------------------------------------------------------------- baca

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}

/** Bentuk `items[]` untuk quote dan order. Tanpa harga. */
export function toCartLines(items: CartItem[]): CartLine[] {
  return items.map((i) => ({ product_id: i.productId, quantity: i.quantity, ...(i.variantId ? { variant_id: i.variantId } : {}) }))
}

/** `ready` false selama render server/hidrasi, supaya "keranjang kosong" tidak berkedip. */
export function useCart(): { items: CartItem[]; ready: boolean } {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY)
  return { items, ready: useMounted() }
}
