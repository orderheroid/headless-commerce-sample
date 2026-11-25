'use client'

import { useState } from 'react'

import { ProductImage } from '@/components/ui'
import { cn } from '@/lib/cn'

/** Main image + selectable thumbnails. */
export function ProductGallery({ name, images }: { name: string; images: { url: string; alt: string }[] }) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? null

  return (
    <div className="space-y-3 md:sticky md:top-24">
      <ProductImage key={current?.url} src={current?.url ?? null} alt={current?.alt} name={name} eager className="aspect-square rounded-[2rem]" />
      {images.length > 1 && (
        <div className="scroll-row flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Choose an image">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Image ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                'h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                i === active ? 'border-fg' : 'border-transparent opacity-60 hover:opacity-100',
              )}
            >
              <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
