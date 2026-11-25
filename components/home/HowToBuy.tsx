import { site } from '@/config/site'

/** Tiga langkah membeli, dari config/site.ts. Blok biru penuh sebagai jeda visual. */
export function HowToBuy() {
  return (
    <section id="cara-beli" className="scroll-mt-24 overflow-hidden rounded-[2rem] bg-brand-600 px-6 py-10 text-white sm:px-10 sm:py-14">
      <h2 className="font-display text-[28px] leading-none sm:text-4xl">{site.home.howToBuyTitle}</h2>
      <ol className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6">
        {site.home.howToBuy.map((step, i) => (
          <li key={step.title} className="flex gap-4 border-t border-white/25 pt-5 sm:flex-col sm:gap-3">
            <span className="font-display text-5xl leading-none text-pop" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="text-lg font-semibold">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/80">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
