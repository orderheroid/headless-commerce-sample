import { ButtonLink, Notice, Price } from '@/components/ui'
import type { ProductDetail } from '@/lib/catalog'

/**
 * Pay-what-you-want product: the API does not accept prices from the client, so this product
 * is bought through the OrderHero order form (`checkout_url`), not through this store's cart.
 */
export function PwywBuy({ pwyw, checkoutUrl }: { pwyw: NonNullable<ProductDetail['pwyw']>; checkoutUrl: string | null }) {
  return (
    <div className="space-y-4">
      <div>
        <Price amount={pwyw.minPrice} prefix="Pay what you want, from" size="lg" />
        {pwyw.suggestedPrice !== null && <Price amount={pwyw.suggestedPrice} prefix="Suggested" className="mt-1 text-fg-muted" />}
      </div>
      {checkoutUrl ? (
        <>
          <ButtonLink href={checkoutUrl} size="lg" block>
            Buy now
          </ButtonLink>
          <p className="text-sm text-fg-subtle">You will be taken to the order form to set your price.</p>
        </>
      ) : (
        <Notice tone="neutral">This product cannot be purchased yet. Please contact the seller.</Notice>
      )}
    </div>
  )
}
