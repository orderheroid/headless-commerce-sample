import { Skeleton } from '@/components/ui'

export default function Loading() {
  return (
    <div className="mx-auto max-w-xl space-y-4" aria-label="Memuat status pesanan">
      <Skeleton className="h-44 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}
