import { Skeleton } from '@/components/ui'

export default function Loading() {
  return (
    <div aria-label="Memuat produk">
      <Skeleton className="mb-4 h-5 w-32" />
      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
