import { ButtonLink, Notice, Price } from '@/components/ui'
import type { ProductDetail } from '@/lib/catalog'

/**
 * Produk harga bebas (pay what you want): API tidak menerima harga dari klien, jadi produk ini
 * dibeli lewat form order OrderHero (`checkout_url`), bukan lewat keranjang toko ini.
 */
export function PwywBuy({ pwyw, checkoutUrl }: { pwyw: NonNullable<ProductDetail['pwyw']>; checkoutUrl: string | null }) {
  return (
    <div className="space-y-4">
      <div>
        <Price amount={pwyw.minPrice} prefix="Harga bebas, mulai" size="lg" />
        {pwyw.suggestedPrice !== null && <Price amount={pwyw.suggestedPrice} prefix="Disarankan" className="mt-1 text-fg-muted" />}
      </div>
      {checkoutUrl ? (
        <>
          <ButtonLink href={checkoutUrl} size="lg" block>
            Beli sekarang
          </ButtonLink>
          <p className="text-sm text-fg-subtle">Kamu akan diarahkan ke form pemesanan untuk menentukan harga.</p>
        </>
      ) : (
        <Notice tone="neutral">Produk ini belum bisa dibeli. Silakan hubungi penjual.</Notice>
      )}
    </div>
  )
}
