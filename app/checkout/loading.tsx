import { Skeleton } from '@/components/ui'

export default function Loading() {
  return (
    <div aria-label="Memuat checkout">
      <Skeleton className="mb-5 h-8 w-40" />
      <div className="grid gap-4 md:grid-cols-[1fr_380px] md:gap-6">
        <div className="grid gap-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}
