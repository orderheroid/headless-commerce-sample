import { Skeleton } from '@/components/ui'

/** Kerangka beranda selama data katalog dimuat. */
export default function Loading() {
  return (
    <div className="space-y-12" aria-label="Memuat">
      <Skeleton className="h-80 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
