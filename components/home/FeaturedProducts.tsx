import { site } from '@/config/site'
import { ProductCard } from '@/components/catalog/ProductCard'
import type { ProductSummary } from '@/lib/catalog'

import { SectionHeader } from './SectionHeader'

/** Rak unggulan: geser horizontal dengan snap, di semua ukuran layar. */
export function FeaturedProducts({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) return null
  return (
    <section aria-label={site.home.featuredTitle}>
      <SectionHeader title={site.home.featuredTitle} href="#produk" />
      <ul className="scroll-row -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {products.map((p, i) => (
          <li key={p.id} className="w-[58%] shrink-0 snap-start sm:w-60 lg:w-64">
            <ProductCard product={p} priority={i < 3} rank={i + 1} />
          </li>
        ))}
      </ul>
    </section>
  )
}
