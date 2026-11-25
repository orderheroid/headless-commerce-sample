'use client'

import { useState } from 'react'

import { Button, ButtonLink, ChoiceList, Icon, Price, QuantityStepper } from '@/components/ui'
import { addToCart } from '@/lib/cart'
import type { ProductDetail } from '@/lib/catalog'

type Props = Pick<ProductDetail, 'id' | 'slug' | 'name' | 'image' | 'price' | 'comparePrice' | 'variants' | 'stock'>

/**
 * Pick a variant and quantity, then save to the cart (localStorage).
 * The price here is catalog display only; the total charged always comes from the quote at checkout.
 * On mobile, the price and button stick to the bottom of the screen.
 */
export function AddToCart(product: Props) {
  const { variants, stock } = product
  const [variantId, setVariantId] = useState<string | null>(variants[0]?.id ?? null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const variant = variants.find((v) => v.id === variantId) ?? null
  const price = variant?.price ?? product.price
  const comparePrice = variant ? variant.comparePrice : product.comparePrice
  const soldOut = stock !== null && stock <= 0
  const canAdd = !soldOut && (variants.length === 0 || variant !== null)

  function add() {
    if (!canAdd) return
    addToCart({
      productId: product.id,
      variantId: variant?.id ?? null,
      quantity,
      name: product.name,
      variantName: variant?.name ?? null,
      image: variant?.image ?? product.image,
      slug: product.slug,
    })
    setAdded(true)
  }

  // After adding: two clear choices, keep shopping or checkout.
  const actions = added ? (
    <div className="grid grid-cols-2 gap-2">
      <ButtonLink href="/" variant="secondary" size="lg">
        Keep shopping
      </ButtonLink>
      <ButtonLink href="/checkout" size="lg">
        Checkout <Icon name="arrow-right" className="h-4 w-4" />
      </ButtonLink>
    </div>
  ) : (
    <Button size="lg" block onClick={add} disabled={!canAdd}>
      {soldOut ? 'Sold out' : 'Add to cart'}
    </Button>
  )

  return (
    <div className="space-y-6">
      <div>
        <Price amount={price} compareAt={comparePrice} size="lg" />
        {/* The stock shown is always product-level stock, not variant stock. */}
        {stock !== null && (
          <p className={soldOut ? 'mt-1.5 text-sm font-medium text-danger' : 'mt-1.5 text-sm text-fg-subtle'}>{soldOut ? 'Sold out' : `${stock} left`}</p>
        )}
      </div>

      {variants.length > 0 && (
        <div>
          <p className="mb-2.5 text-sm font-medium text-fg">Choose a variant</p>
          <ChoiceList
            name="variant"
            label="Choose a variant"
            layout="chips"
            value={variantId}
            onChange={(id) => {
              setVariantId(id)
              setAdded(false)
            }}
            choices={variants.map((v) => ({ value: v.id, label: v.name }))}
          />
        </div>
      )}

      {!soldOut && (
        <div className="flex items-center justify-between gap-3 md:justify-start">
          <span className="text-sm font-medium text-fg">Quantity</span>
          <QuantityStepper
            value={quantity}
            onChange={(q) => {
              setQuantity(q)
              setAdded(false)
            }}
            max={Math.min(100, stock ?? 100)}
            label={product.name}
          />
        </div>
      )}

      {added && (
        <p className="flex items-center gap-2 text-sm font-medium text-success" role="status">
          <Icon name="check-circle" className="h-5 w-5" /> Added to cart
        </p>
      )}

      <div className="hidden md:block">{actions}</div>

      {/* Action bar on mobile: always within thumb reach. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
        {added ? (
          actions
        ) : (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-fg-subtle">Price</p>
              <Price amount={price} size="md" className="[&>span]:truncate" />
            </div>
            <Button size="lg" onClick={add} disabled={!canAdd} className="min-w-44">
              {soldOut ? 'Sold out' : 'Add to cart'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
