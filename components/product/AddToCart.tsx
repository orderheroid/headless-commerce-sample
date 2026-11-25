'use client'

import { useState } from 'react'

import { Button, ButtonLink, ChoiceList, Icon, Price, QuantityStepper } from '@/components/ui'
import { addToCart } from '@/lib/cart'
import type { ProductDetail } from '@/lib/catalog'

type Props = Pick<ProductDetail, 'id' | 'slug' | 'name' | 'image' | 'price' | 'comparePrice' | 'variants' | 'stock'>

/**
 * Pilih varian dan jumlah, lalu simpan ke keranjang (localStorage).
 * Harga di sini hanya tampilan katalog; total yang ditagih selalu dari quote di checkout.
 * Di HP, harga dan tombol menempel di bawah layar.
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

  // Setelah ditambahkan: dua pilihan jelas, lanjut belanja atau checkout.
  const actions = added ? (
    <div className="grid grid-cols-2 gap-2">
      <ButtonLink href="/" variant="secondary" size="lg">
        Belanja lagi
      </ButtonLink>
      <ButtonLink href="/checkout" size="lg">
        Checkout <Icon name="arrow-right" className="h-4 w-4" />
      </ButtonLink>
    </div>
  ) : (
    <Button size="lg" block onClick={add} disabled={!canAdd}>
      {soldOut ? 'Stok habis' : 'Tambah ke keranjang'}
    </Button>
  )

  return (
    <div className="space-y-6">
      <div>
        <Price amount={price} compareAt={comparePrice} size="lg" />
        {/* Stok yang ditampilkan selalu stok tingkat produk, bukan stok varian. */}
        {stock !== null && (
          <p className={soldOut ? 'mt-1.5 text-sm font-medium text-danger' : 'mt-1.5 text-sm text-fg-subtle'}>{soldOut ? 'Stok habis' : `Tersisa ${stock}`}</p>
        )}
      </div>

      {variants.length > 0 && (
        <div>
          <p className="mb-2.5 text-sm font-medium text-fg">Pilih varian</p>
          <ChoiceList
            name="variant"
            label="Pilih varian"
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
          <span className="text-sm font-medium text-fg">Jumlah</span>
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
          <Icon name="check-circle" className="h-5 w-5" /> Ditambahkan ke keranjang
        </p>
      )}

      <div className="hidden md:block">{actions}</div>

      {/* Bar aksi di HP: selalu terjangkau ibu jari. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
        {added ? (
          actions
        ) : (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-fg-subtle">Harga</p>
              <Price amount={price} size="md" className="[&>span]:truncate" />
            </div>
            <Button size="lg" onClick={add} disabled={!canAdd} className="min-w-44">
              {soldOut ? 'Stok habis' : 'Tambah ke keranjang'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
