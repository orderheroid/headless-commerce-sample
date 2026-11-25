import { site } from '@/config/site'
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { HomeHero } from '@/components/home/HomeHero'
import { HowToBuy } from '@/components/home/HowToBuy'
import { SectionHeader } from '@/components/home/SectionHeader'
import { TrustStrip } from '@/components/home/TrustStrip'
import { Notice } from '@/components/ui'
import { getCatalog, pickFeatured, type ProductSummary } from '@/lib/catalog'
import { toFailure } from '@/lib/orderhero'
import { storeName } from '@/lib/store'

// Katalog di-cache di server dan dibangun ulang paling cepat tiap 300 detik.
export const revalidate = 300

/** Beranda: susunan bagian diatur di sini; isi teksnya di config/site.ts. */
export default async function HomePage() {
  const name = await storeName()
  let products: ProductSummary[]
  try {
    products = await getCatalog()
  } catch (err) {
    return <Notice title="Katalog belum bisa dimuat">{toFailure(err).message}</Notice>
  }

  const featured = pickFeatured(products, site.home.featuredCount)

  return (
    <div className="space-y-14 sm:space-y-20">
      <div className="space-y-8 sm:space-y-10">
        <HomeHero storeName={name} showcase={featured} productCount={products.length} />
        <TrustStrip />
      </div>

      <FeaturedProducts products={featured} />

      <section id="produk" className="scroll-mt-20" aria-label={site.home.catalogTitle}>
        <SectionHeader title={site.home.catalogTitle} />
        {products.length === 0 ? <Notice tone="neutral">Belum ada produk yang dijual saat ini.</Notice> : <CatalogBrowser products={products} />}
      </section>

      <HowToBuy />
    </div>
  )
}
