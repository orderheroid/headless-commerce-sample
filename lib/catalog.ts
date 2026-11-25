import 'server-only'

import { getProduct, listDigitalProducts } from './orderhero'
import { plainText, sanitizeDescription } from './sanitize'
import type { Product } from './types'

// Turns API products into display data. Pages and components only receive the shapes below,
// so catalog rules (active variants, product-level stock, pay-what-you-want) only need changing here.

export type ProductSummary = {
  id: string
  slug: string
  name: string
  summary: string | null
  image: string | null
  price: number
  comparePrice: number | null
  hasVariants: boolean
  soldOut: boolean
  /** Marked "featured" by the merchant in the dashboard */
  featured: boolean
  /** Pay-what-you-want (PWYW) product: minimum price, or null */
  pwywMin: number | null
  category: { id: string; name: string } | null
}

export type VariantOption = { id: string; name: string; price: number | null; comparePrice: number | null; image: string | null }

export type ProductDetail = ProductSummary & {
  images: { url: string; alt: string }[]
  variants: VariantOption[]
  /** Product-level stock; null = stock is not tracked */
  stock: number | null
  descriptionHtml: string
  pwyw: { minPrice: number; suggestedPrice: number | null } | null
  checkoutUrl: string | null
  metaTitle: string
  metaDescription: string | null
}

function sortedImages(p: Product) {
  return [...p.images].sort((a, b) => Number(b.is_primary ?? false) - Number(a.is_primary ?? false) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

function activeVariants(p: Product): VariantOption[] {
  return p.variants
    .filter((v): v is typeof v & { id: string } => v.is_active && typeof v.id === 'string')
    .map((v) => ({ id: v.id, name: v.name, price: v.price, comparePrice: v.compare_price, image: v.image_url }))
}

function toSummary(p: Product): ProductSummary {
  return {
    id: p.id,
    slug: p.slug ?? p.id,
    name: p.name,
    summary: plainText(p.short_description) ?? plainText(p.description, 140),
    image: sortedImages(p)[0]?.url ?? null,
    price: p.price,
    comparePrice: p.compare_price,
    hasVariants: activeVariants(p).length > 0,
    soldOut: p.track_inventory && (p.stock_quantity ?? 0) <= 0,
    featured: p.is_featured === true,
    pwywMin: p.pay_what_you_want?.min_price ?? null,
    category: p.category,
  }
}

/** Catalog for the home page (digital products only, featured first; cached for 300 seconds). */
export async function getCatalog(): Promise<ProductSummary[]> {
  return (await listDigitalProducts()).map(toSummary)
}

/**
 * Products for the "featured" showcase: those marked by the merchant, then topped up with other products
 * that have an image and are not sold out, up to `limit`.
 */
export function pickFeatured(products: ProductSummary[], limit: number): ProductSummary[] {
  const available = products.filter((p) => !p.soldOut)
  const marked = available.filter((p) => p.featured)
  // Top-up: with an image, and pay-what-you-want products last (bought through the OrderHero form).
  const rest = available.filter((p) => !p.featured && p.image).sort((a, b) => Number(a.pwywMin !== null) - Number(b.pwywMin !== null))
  return [...marked, ...rest].slice(0, limit)
}

/** Product detail; null if it does not exist, is inactive, or is not a digital product. */
export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  const p = await getProduct(slug)
  // This store is digital products only; physical products need an address and shipping, which are not built here.
  if (!p || !p.is_digital) return null
  const summary = toSummary(p)
  return {
    ...summary,
    images: sortedImages(p).map((i) => ({ url: i.url, alt: i.alt ?? p.name })),
    variants: activeVariants(p),
    stock: p.track_inventory ? Math.max(0, p.stock_quantity ?? 0) : null,
    descriptionHtml: sanitizeDescription(p.description),
    pwyw: p.pay_what_you_want ? { minPrice: p.pay_what_you_want.min_price, suggestedPrice: p.pay_what_you_want.suggested_price } : null,
    checkoutUrl: p.checkout_url,
    metaTitle: p.meta_title || p.name,
    metaDescription: plainText(p.meta_description) ?? summary.summary,
  }
}
