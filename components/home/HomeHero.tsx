import Link from 'next/link'

import { site } from '@/config/site'
import { ButtonLink, Icon, ProductImage } from '@/components/ui'
import type { ProductSummary } from '@/lib/catalog'
import { cn } from '@/lib/cn'

/** Posisi tiga sampul yang "berkipas": kiri miring, tengah di depan, kanan miring. */
const FAN = ['-rotate-[8deg] translate-x-5 translate-y-3', 'z-10 -translate-y-1 scale-105', 'rotate-[8deg] -translate-x-5 translate-y-3']

/** Pembuka beranda: judul besar, ajakan, dan tumpukan sampul produk. */
export function HomeHero({ storeName, showcase, productCount }: { storeName: string; showcase: ProductSummary[]; productCount: number }) {
  const covers = showcase.filter((p) => p.image).slice(0, 3)

  return (
    <section className="grid items-center gap-8 pt-4 sm:pt-8 md:grid-cols-[1.15fr_1fr] md:gap-6 md:pb-6">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
          </span>
          {site.home.eyebrow.replace('{store}', storeName)}
        </p>

        <h1 className="mt-5 font-display text-[40px] leading-[1.05] text-fg sm:text-6xl lg:text-[68px]">
          {site.home.title}{' '}
          <em className="marker whitespace-nowrap px-1">{site.home.titleAccent}</em>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-fg-muted sm:text-lg">{site.home.subtitle}</p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <ButtonLink href="#produk" size="lg">
            {site.home.primaryCta}
            <Icon name="arrow-right" className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="#cara-beli" size="lg" variant="secondary">
            {site.home.secondaryCta}
          </ButtonLink>
        </div>
        <p className="mt-4 text-sm text-fg-subtle">{productCount} produk siap dikirim otomatis</p>
      </div>

      {covers.length === 3 && (
        <div className="flex justify-center py-4 md:py-0" aria-hidden="true">
          {covers.map((p, i) => (
            <Link
              key={p.id}
              href={`/produk/${encodeURIComponent(p.slug)}`}
              tabIndex={-1}
              className={cn('w-[34%] max-w-52 transition duration-300 hover:z-20 hover:-translate-y-3 hover:rotate-0', FAN[i])}
            >
              <ProductImage src={p.image} name={p.name} alt="" eager className="aspect-square rounded-2xl shadow-2xl shadow-black/20 ring-1 ring-black/5" />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
