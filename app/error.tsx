'use client'

import { Button, ButtonLink } from '@/components/ui'

/** Batas galat halaman: kesalahan tak terduga tidak menampilkan layar putih. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-4xl tracking-tight">Ada yang tidak beres</h1>
      <p className="mt-2 text-fg-muted">Halaman ini gagal dimuat. Coba lagi sebentar lagi.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={reset}>Coba lagi</Button>
        <ButtonLink href="/" variant="secondary">
          Ke beranda
        </ButtonLink>
      </div>
    </div>
  )
}
