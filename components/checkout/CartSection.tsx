'use client'

import Link from 'next/link'

import { Card, CardHeader, Icon, ProductImage, QuantityStepper } from '@/components/ui'
import { removeFromCart, setQuantity, type CartItem } from '@/lib/cart'

export function CartSection({ items, disabled, step }: { items: CartItem[]; disabled?: boolean; step?: number }) {
  return (
    <Card>
      <CardHeader step={step} title="Cart" description={`${items.length} ${items.length === 1 ? 'product' : 'products'}`} />
      <ul className="-my-3 divide-y divide-line-soft">
        {items.map((item) => (
          <li key={`${item.productId}:${item.variantId}`} className="flex gap-3 py-3">
            <ProductImage src={item.image} name={item.name} alt="" className="h-16 w-16 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Link href={`/produk/${encodeURIComponent(item.slug)}`} className="line-clamp-2 text-sm font-medium text-fg hover:underline">
                {item.name}
              </Link>
              {item.variantName && <p className="text-xs text-fg-subtle">{item.variantName}</p>}
              <div className="mt-2 flex items-center justify-between gap-2">
                <QuantityStepper
                  size="sm"
                  value={item.quantity}
                  onChange={(q) => setQuantity(item.productId, item.variantId, q)}
                  disabled={disabled}
                  label={item.name}
                />
                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId, item.variantId)}
                  disabled={disabled}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-fg-subtle hover:bg-danger-soft hover:text-danger disabled:opacity-40"
                  aria-label={`Remove ${item.name}`}
                >
                  <Icon name="trash" className="h-4 w-4" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
