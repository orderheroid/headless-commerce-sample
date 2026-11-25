import Link from 'next/link'

import { Price, ProductImage } from '@/components/ui'
import type { ProductSummary } from '@/lib/catalog'
import { cn } from '@/lib/cn'

import { QuickAdd } from './QuickAdd'

type Props = {
  product: ProductSummary
  /** Gambar dimuat lebih dulu (kartu di bagian atas halaman). */
  priority?: boolean
  /** Nomor urut besar di sudut gambar (rak unggulan). */
  rank?: number
}

/** Kartu produk: bingkai tipis, sampul di dalam, teks di bawah, harga dan tombol "+" sejajar. */
export function ProductCard({ product, priority, rank }: Props) {
  const href = `/produk/${encodeURIComponent(product.slug)}`
  const discounted = product.comparePrice != null && product.comparePrice > product.price

  return (
    <article className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-2 transition-colors duration-200 hover:border-line-strong sm:p-2.5">
      <Link href={href} className="relative block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" tabIndex={-1} aria-hidden="true">
        <ProductImage
          src={product.image}
          name={product.name}
          alt=""
          eager={priority}
          className={cn('aspect-square transition duration-500 ease-out group-hover:scale-[1.04]', product.soldOut && 'opacity-60 grayscale')}
        />
        <span className="absolute left-2.5 top-2.5 flex flex-wrap gap-1">
          {product.soldOut && <Badge tone="ink">Habis</Badge>}
          {!product.soldOut && discounted && <Badge tone="pop">Diskon</Badge>}
          {product.pwywMin !== null && <Badge tone="surface">Harga bebas</Badge>}
        </span>
        {rank !== undefined && (
          <span className="absolute bottom-1 right-3 font-display text-6xl leading-none text-white [text-shadow:0_2px_12px_rgb(0_0_0/0.45)]">{String(rank).padStart(2, '0')}</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-3 sm:px-2 sm:pb-2">
        {product.category && <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">{product.category.name}</p>}
        <h3 className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug text-fg">
          <Link href={href} className="rounded hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          {product.pwywMin !== null ? (
            <Price amount={product.pwywMin} prefix="mulai" />
          ) : (
            <Price amount={product.price} compareAt={product.comparePrice} prefix={product.hasVariants ? 'mulai' : undefined} className="flex-col gap-0" />
          )}
          <QuickAdd product={product} />
        </div>
      </div>
    </article>
  )
}

function Badge({ tone, children }: { tone: 'ink' | 'pop' | 'surface'; children: React.ReactNode }) {
  const tones = { ink: 'bg-black/80 text-white', pop: 'bg-pop text-black', surface: 'bg-white/95 text-black' }
  return <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none', tones[tone])}>{children}</span>
}
