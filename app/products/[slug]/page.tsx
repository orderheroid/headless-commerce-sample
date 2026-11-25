import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Assurances } from '@/components/layout/Assurances'
import { AddToCart } from '@/components/product/AddToCart'
import { ProductGallery } from '@/components/product/ProductGallery'
import { PwywBuy } from '@/components/product/PwywBuy'
import { Icon, Notice } from '@/components/ui'
import { getProductDetail, type ProductDetail } from '@/lib/catalog'
import { toFailure } from '@/lib/orderhero'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductDetail(slug).catch(() => null)
  if (!product) return { title: 'Product not found' }
  return { title: product.metaTitle, description: product.metaDescription ?? undefined }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  let product: ProductDetail | null
  try {
    product = await getProductDetail(slug)
  } catch (err) {
    return <Notice title="The product could not be loaded">{toFailure(err).message}</Notice>
  }
  if (!product) notFound()

  return (
    // Bottom space on mobile for the sticky "Add to cart" bar.
    <article className="pb-24 md:pb-0">
      <Link href="/" className="mb-4 inline-flex h-9 items-center gap-1.5 rounded-full pr-3 text-sm font-medium text-fg-muted hover:text-fg">
        <Icon name="arrow-left" className="h-4 w-4" /> All products
      </Link>

      <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-12">
        <ProductGallery name={product.name} images={product.images} />

        <div className="space-y-7">
          <header>
            {product.category && <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent">{product.category.name}</p>}
            <h1 className="mt-2 font-display text-[28px] leading-[1.1] sm:text-4xl">{product.name}</h1>
            {product.summary && <p className="mt-3 leading-relaxed text-fg-muted">{product.summary}</p>}
          </header>

          {product.pwyw ? <PwywBuy pwyw={product.pwyw} checkoutUrl={product.checkoutUrl} /> : <AddToCart {...product} />}

          <Assurances className="border-t border-line pt-6" />

          {product.descriptionHtml && (
            <section className="border-t border-line pt-6">
              <h2 className="mb-3 font-display text-2xl">About this product</h2>
              <div className="prose-store text-fg-muted" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            </section>
          )}
        </div>
      </div>
    </article>
  )
}
